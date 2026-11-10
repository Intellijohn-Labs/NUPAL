/**
 * Turns the free-text Ingredients field into a list of items for bullet points.
 * Works with one ingredient per line, markdown bullets ("- Amla"), numbered lines,
 * or a single line separated by commas/semicolons ("Amla, Haritaki, Bhringraj").
 * Commas inside brackets are kept, e.g. "Amla (Emblica officinalis, fruit)".
 */
export function ingredientList(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
  const parts = lines.length === 1 ? splitOutsideBrackets(lines[0]) : lines;
  return parts.map((x) => x.replace(/[.;,]+$/, "").trim()).filter(Boolean);
}

function splitOutsideBrackets(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === ";") && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}
