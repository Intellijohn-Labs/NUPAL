import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);
const MAX_BYTES = 6 * 1024 * 1024;

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Saves an uploaded image and returns its public URL. Storage is chosen by environment:
 * 1. Supabase Storage — when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set (recommended)
 * 2. Vercel Blob      — when BLOB_READ_WRITE_TOKEN is set
 * 3. Local ./uploads  — otherwise (served from /uploads/…), e.g. on NUPAL’s own server
 */
export async function saveImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Upload a JPG, PNG, WebP, AVIF or SVG image.");
  if (file.size > MAX_BYTES) throw new Error("Images must be 6 MB or smaller.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  const supaUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supaUrl && supaKey) {
    const bucket = process.env.SUPABASE_BUCKET || "nupal";
    const res = await fetch(`${supaUrl}/storage/v1/object/${bucket}/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${supaKey}`, apikey: supaKey, "Content-Type": file.type, "x-upsert": "false", "Cache-Control": "31536000" },
      body: Buffer.from(await file.arrayBuffer()),
    });
    if (!res.ok) throw new Error(`Image upload failed (${res.status}). Check that the “${bucket}” storage bucket exists and is public.`);
    return `${supaUrl}/storage/v1/object/public/${bucket}/${name}`;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  const target = path.join(UPLOAD_DIR, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Saves every non-empty file in a FormData field. */
export async function saveImages(files: FormDataEntryValue[], folder: string) {
  const urls: string[] = [];
  for (const f of files) {
    if (f instanceof File && f.size > 0) urls.push(await saveImage(f, folder));
  }
  return urls;
}

/** Best-effort removal of a stored image (Supabase Storage or local ./uploads). Never throws. */
export async function deleteStoredFile(url: string) {
  try {
    const supaUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_BUCKET || "nupal";
    const prefix = supaUrl ? `${supaUrl}/storage/v1/object/public/${bucket}/` : null;
    if (prefix && key && url.startsWith(prefix)) {
      await fetch(`${supaUrl}/storage/v1/object/${bucket}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [url.slice(prefix.length)] }),
      });
    } else if (url.startsWith("/uploads/")) {
      const { unlink } = await import("node:fs/promises");
      const file = path.normalize(path.join(UPLOAD_DIR, url.slice("/uploads/".length)));
      if (file.startsWith(UPLOAD_DIR)) await unlink(file);
    }
  } catch {}
}
