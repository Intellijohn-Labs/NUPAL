export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const pctOff = (mrp: number, price: number) => (mrp > price ? Math.round((1 - price / mrp) * 100) : 0);

/** Minutes from midnight → "10:30 AM" */
export function minToLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** "HH:MM" → minutes */
export const hhmmToMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const minToHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const lines = (s: string) =>
  s
    .split(/\r?\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
