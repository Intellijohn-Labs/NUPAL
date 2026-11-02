"use server";

import { randomUUID } from "node:crypto";
import { currentUser } from "@/lib/auth";
import { saveImage } from "@/lib/storage";

const FOLDERS = new Set(["products", "banners", "doctors", "testimonials", "results", "pages", "misc"]);
const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/svg+xml": "svg", "image/avif": "avif" };

export type UploadTargets =
  | { mode: "supabase"; targets: { uploadUrl: string; publicUrl: string }[] }
  | { mode: "server" }
  | { mode: "error"; error: string };

function supa() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key, bucket: process.env.SUPABASE_BUCKET || "nupal" } : null;
}

/**
 * Gives the browser one-time upload links so photos go straight to Supabase Storage
 * (avoids Vercel’s ~4.5 MB request limit). Without Supabase, the browser sends files to the server instead.
 */
export async function getUploadTargets(folder: string, types: string[]): Promise<UploadTargets> {
  if (!(await currentUser())) return { mode: "error", error: "Please sign in again." };
  if (!FOLDERS.has(folder)) return { mode: "error", error: "Unknown upload folder." };
  if (types.length > 200) return { mode: "error", error: "Upload up to 200 photos at a time." };
  const s = supa();
  if (!s) return { mode: "server" };

  const targets = [];
  for (const type of types) {
    const ext = TYPES[type];
    if (!ext) return { mode: "error", error: "Only JPG, PNG, WebP, AVIF or SVG images can be uploaded." };
    const path = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const res = await fetch(`${s.url}/storage/v1/object/upload/sign/${s.bucket}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.key}`, apikey: s.key, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return { mode: "error", error: `Storage refused the upload (${res.status}). Check that the “${s.bucket}” bucket exists.` };
    const data = (await res.json()) as { url: string };
    targets.push({ uploadUrl: `${s.url}/storage/v1${data.url}`, publicUrl: `${s.url}/storage/v1/object/public/${s.bucket}/${path}` });
  }
  return { mode: "supabase", targets };
}

/** Fallback when Supabase Storage isn’t configured: one (already compressed) file per call. */
export async function uploadViaServer(fd: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await currentUser())) return { error: "Please sign in again." };
  const folder = String(fd.get("folder") ?? "misc");
  const file = fd.get("file");
  if (!FOLDERS.has(folder) || !(file instanceof File)) return { error: "Invalid upload." };
  try {
    return { url: await saveImage(file, folder) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
