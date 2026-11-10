import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { UPLOAD_DIR, saveImage } from "@/lib/storage";

/** Tidied photos carry this marker, so they are never processed twice. */
export const TIDY_MARK = "?v=tidy";

/** Reads a stored product photo: Supabase/Blob URL, /uploads/… on this server, or a file in /public. */
async function readStored(url: string): Promise<Buffer | null> {
  if (/^https?:\/\//.test(url)) {
    const own = [process.env.SUPABASE_URL, "blob.vercel-storage.com"].filter(Boolean) as string[];
    if (!own.some((o) => url.includes(o.replace(/^https?:\/\//, "").replace(/\/$/, "")))) return null; // only our own storage
    const res = await fetch(url);
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  }
  const rel = url.split("?")[0];
  const file = rel.startsWith("/uploads/") ? path.join(UPLOAD_DIR, rel.slice("/uploads/".length)) : path.join(process.cwd(), "public", rel);
  if (!file.startsWith(UPLOAD_DIR) && !file.startsWith(path.join(process.cwd(), "public"))) return null;
  return readFile(file).catch(() => null);
}

/**
 * Makes a product photo square with no white frame:
 * trims plain white borders; a photo that fills its frame is cropped to a centred square,
 * a pack shot on white is centred on a white square with only a hairline margin.
 */
export async function tidyBuffer(input: Buffer): Promise<Buffer> {
  const base = sharp(input).rotate();
  const { data: trimmed, info } = await base
    .clone()
    .trim({ background: "#ffffff", threshold: 22 })
    .toBuffer({ resolveWithObject: true })
    .catch(async () => ({ data: await base.clone().toBuffer(), info: await sharp(input).metadata().then((m) => ({ width: m.width ?? 1, height: m.height ?? 1 })) }));
  const w = info.width, h = info.height;
  const ratio = w / h;
  let img: sharp.Sharp;
  if (ratio > 0.88 && ratio < 1.14) {
    // A scene/photo (roughly square once the frame is gone): fill the square edge to edge.
    const side = Math.min(1200, Math.max(w, h));
    img = sharp(trimmed).resize(side, side, { fit: "cover", position: "centre" });
  } else {
    // A pack shot: centre it on white with a hairline margin.
    const side = Math.round(Math.max(w, h) * 1.04);
    img = sharp(trimmed).extend({
      top: Math.floor((side - h) / 2), bottom: Math.ceil((side - h) / 2),
      left: Math.floor((side - w) / 2), right: Math.ceil((side - w) / 2),
      background: "#ffffff",
    });
    if (side > 1200) img = sharp(await img.toBuffer()).resize(1200, 1200);
  }
  return img.flatten({ background: "#ffffff" }).webp({ quality: 86 }).toBuffer();
}

/** Tidies one stored photo and saves it as a new file. Returns the new URL, or null to keep the old one. */
export async function tidyStoredPhoto(url: string): Promise<string | null> {
  if (url.includes(TIDY_MARK) || /\.svg(\?|$)/i.test(url)) return null;
  const buf = await readStored(url);
  if (!buf) return null;
  const out = await tidyBuffer(buf);
  const saved = await saveImage(new File([new Uint8Array(out)], "photo.webp", { type: "image/webp" }), "products");
  return saved + TIDY_MARK;
}
