/**
 * One-time import of before/after photos into Admin → Real results → Photo inbox.
 *
 *   npx tsx scripts/import-results.ts "C:\path\to\photos"
 *
 * - Reads every JPG / PNG / WebP in the folder and its sub-folders.
 * - Shrinks each to max 1600 px (WebP) and uploads it to Supabase Storage (or ./uploads without Supabase).
 * - Guesses the patient ID from the file name or folder name (e.g. “NU 61244”), and before/after from the
 *   file name (“before”, “after”). Everything lands in the Photo inbox for review — nothing is published.
 * - Safe to re-run: files already imported (same name + patient) are skipped.
 */
import { readFileSync, existsSync } from "node:fs";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { guessFromFilename } from "../src/lib/patient";

// Load .env without extra packages.
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const db = new PrismaClient();
const SUPA = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "nupal";
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

async function store(buf: Buffer): Promise<string> {
  const name = `results/${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
  if (SUPA && KEY) {
    const res = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "image/webp", "Cache-Control": "31536000" },
      body: new Uint8Array(buf),
    });
    if (!res.ok) throw new Error(`Supabase upload failed (${res.status}): ${await res.text()}`);
    return `${SUPA}/storage/v1/object/public/${BUCKET}/${name}`;
  }
  const target = path.join(process.cwd(), "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buf);
  return `/uploads/${name}`;
}

async function main() {
  const root = process.argv[2];
  if (!root || !existsSync(root)) {
    console.error('Usage: npx tsx scripts/import-results.ts "path/to/folder"');
    process.exit(1);
  }
  const files = await walk(root);
  console.log(`Found ${files.length} photos in ${root}`);
  let done = 0, skipped = 0, failed = 0, next = 0;

  async function worker() {
    while (next < files.length) {
      const file = files[next++];
      const filename = path.basename(file);
      const fromName = guessFromFilename(filename);
      const fromFolder = guessFromFilename(path.basename(path.dirname(file)) + ".x");
      const patientId = fromName.patientId || fromFolder.patientId;
      try {
        if (await db.resultUpload.findFirst({ where: { filename, patientId } })) {
          skipped++;
          continue;
        }
        const buf = await sharp(file).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        const url = await store(buf);
        await db.resultUpload.create({ data: { url, filename, patientId, role: fromName.role } });
        done++;
        if (done % 10 === 0) console.log(`  ${done} uploaded…`);
      } catch (e) {
        failed++;
        console.error(`  ✗ ${filename}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log(`Done. Uploaded ${done}, skipped ${skipped} (already imported), failed ${failed}.`);
  console.log("Open Admin → Real results → Photo inbox to pair and publish them.");
}

main().finally(() => db.$disconnect());
