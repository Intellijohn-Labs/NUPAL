"use client";

import { getUploadTargets, uploadViaServer } from "@/app/admin/upload-actions";

/** Shrinks a photo in the browser (keeps orientation) so uploads are fast and pages load quickly. */
export async function compressImage(file: File, maxSide = 1600): Promise<Blob> {
  if (file.type === "image/svg+xml") return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
    if (blob && blob.type === "image/webp") return blob;
    return (await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85))) ?? file;
  } catch {
    return file; // unreadable in this browser (e.g. HEIC) — upload as is
  }
}

export type UploadState = { name: string; status: "waiting" | "uploading" | "done" | "failed"; url?: string; error?: string };

/**
 * Compresses and uploads files (4 at a time). Calls onUpdate whenever a file’s state changes.
 * Returns the final state for every file, in the same order.
 */
export async function uploadFiles(files: File[], folder: string, onUpdate?: (i: number, s: UploadState) => void, maxSide = 1600) {
  const states: UploadState[] = files.map((f) => ({ name: f.name, status: "waiting" }));
  const set = (i: number, s: Partial<UploadState>) => {
    states[i] = { ...states[i], ...s };
    onUpdate?.(i, states[i]);
  };

  const blobs: Blob[] = [];
  for (let i = 0; i < files.length; i++) blobs.push(await compressImage(files[i], maxSide));
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
