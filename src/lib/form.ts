import { saveImages } from "./storage";

export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const optStr = (f: FormData, k: string) => str(f, k) || null;
export const int = (f: FormData, k: string, def = 0) => {
  const n = parseInt(str(f, k), 10);
  return Number.isFinite(n) ? n : def;
};
export const optInt = (f: FormData, k: string) => {
  const s = str(f, k);
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};
export const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
export const list = (f: FormData, k: string) =>
  str(f, k)
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Kept existing images (in order) followed by newly uploaded ones. */
export async function collectImages(f: FormData, name: string, folder: string) {
  const keep = f.getAll(`${name}_keep`).map(String);
  const added = await saveImages(f.getAll(`${name}_files`), folder);
  return [...keep, ...added];
}
