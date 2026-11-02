/** Normalises patient IDs to “NU 61244”. Accepts “nu61244”, “NU-61244”, “61244”… */
export function normalisePatientId(s: string) {
  const t = s.trim().toUpperCase();
  const m = t.match(/^(?:NU)?[\s_-]*(\d{3,8})$/);
  return m ? `NU ${m[1]}` : t;
}

/** Guesses patient ID and before/after from a file name such as “NU61244_before (2).jpg”. */
export function guessFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  // “NU61244…”, or a file name that starts with the number, like “61244_after”.
  const id = base.match(/NU[\s_-]*(\d{3,8})/i) ?? base.match(/^(\d{5,6})(?=[\s_.-]|$)/);
  const role = /(^|[^a-z])(before|bfr|pre)([^a-z]|$)/i.test(base) ? "before" : /(^|[^a-z])(after|aft|post)([^a-z]|$)/i.test(base) ? "after" : "";
  return { patientId: id ? `NU ${id[1]}` : "", role };
}
