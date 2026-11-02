"use client";

import { getUploadTargets, uploadViaServer } from "@/app/admin/upload-actions";

export type ImageOptions = {
  /** Longest side in pixels after resizing. */
  maxSide?: number;
  /**
   * Product photos: trim plain white/empty borders, then centre the product on a square
   * with even padding — so every product looks the same size in the shop.
   */
  square?: boolean;
};

async function loadBitmap(file: File) {
  return createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
}

/** Finds the box around the product, ignoring near-white or transparent borders. */
function contentBox(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { data } = ctx.getImageData(0, 0, w, h);
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4;
      const empty = data[i + 3] < 16 || (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238);
      if (!empty) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return { x: 0, y: 0, w, h };
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Shrinks a photo in the browser (keeps orientation) so uploads are fast and pages load quickly. */
export async function compressImage(file: File, opts: ImageOptions | number = {}): Promise<Blob> {
  const { maxSide = 1600, square = false } = typeof opts === "number" ? { maxSide: opts } : opts;
  if (file.type === "image/svg+xml") return file;
  try {
    const bmp = await loadBitmap(file);
    const scale = Math.min(1, (square ? 1600 : maxSide) / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: square })!;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();

    if (square) {
      const box = contentBox(ctx, w, h);
      const side = Math.round(Math.max(box.w, box.h) * 1.16); // 8% breathing room on each side
      const out = Math.min(side, maxSide);
      const k = out / side;
      const sq = document.createElement("canvas");
      sq.width = out;
      sq.height = out;
      const sctx = sq.getContext("2d")!;
      sctx.fillStyle = "#ffffff";
      sctx.fillRect(0, 0, out, out);
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(canvas, box.x, box.y, box.w, box.h, (out - box.w * k) / 2, (out - box.h * k) / 2, box.w * k, box.h * k);
      canvas = sq;
    }

    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    if (blob && blob.type === "image/webp") return blob;
    return (await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88))) ?? file;
  } catch {
    return file; // unreadable in this browser (e.g. HEIC) — upload as is
  }
}

export type UploadState = { name: string; status: "waiting" | "uploading" | "done" | "failed"; url?: string; error?: string };

/**
 * Compresses and uploads files (4 at a time). Calls onUpdate whenever a file’s state changes.
 * Returns the final state for every file, in the same order.
 */
export async function uploadFiles(files: File[], folder: string, onUpdate?: (i: number, s: UploadState) => void, opts: ImageOptions | number = {}) {
  const states: UploadState[] = files.map((f) => ({ name: f.name, status: "waiting" }));
  const set = (i: number, s: Partial<UploadState>) => {
    states[i] = { ...states[i], ...s };
    onUpdate?.(i, states[i]);
  };

  const blobs: Blob[] = [];
  for (let i = 0; i < files.length; i++) blobs.push(await compressImage(files[i], opts));
  const targets = await getUploadTargets(folder, blobs.map((b) => b.type || "image/jpeg"));
  if (targets.mode === "error") {
    files.forEach((_, i) => set(i, { status: "failed", error: targets.error }));
    return states;
  }

  let next = 0;
  async function worker() {
    while (next < files.length) {
      const i = next++;
      set(i, { status: "uploading" });
      try {
        if (targets.mode === "supabase") {
          const t = (targets as Extract<typeof targets, { mode: "supabase" }>).targets[i];
          const body = new FormData();
          body.append("cacheControl", "31536000");
          body.append("", blobs[i], files[i].name);
          const res = await fetch(t.uploadUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
          if (!res.ok) throw new Error(`Upload failed (${res.status})`);
          set(i, { status: "done", url: t.publicUrl });
        } else {
          const fd = new FormData();
          fd.append("folder", folder);
          const ext = blobs[i].type === "image/webp" ? "webp" : blobs[i].type === "image/png" ? "png" : "jpg";
          fd.append("file", new File([blobs[i]], files[i].name.replace(/\.[^.]+$/, "") + "." + ext, { type: blobs[i].type || "image/jpeg" }));
          const r = await uploadViaServer(fd);
          if (!r.url) throw new Error(r.error || "Upload failed");
          set(i, { status: "done", url: r.url });
        }
      } catch (e) {
        set(i, { status: "failed", error: e instanceof Error ? e.message : "Upload failed" });
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  return states;
}
