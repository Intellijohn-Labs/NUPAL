import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", svg: "image/svg+xml",
};

// Serves images saved to ./uploads when the site runs without Vercel Blob (local / own server).
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.normalize(path.join(UPLOAD_DIR, ...parts));
  if (!file.startsWith(UPLOAD_DIR)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    const ext = file.split(".").pop()?.toLowerCase() ?? "";
    return new Response(data, {
      headers: { "Content-Type": TYPES[ext] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
