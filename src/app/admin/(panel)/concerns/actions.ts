"use server";

import { revalidatePath } from "next/cache";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { bool, int, str } from "@/lib/form";

export async function saveConcern(id: string | null, f: FormData) {
  await requireArea("concerns");
  const name = str(f, "name");
  if (!name) return;
  const data = { name, icon: str(f, "icon") || "leaf", sortOrder: int(f, "sortOrder"), active: bool(f, "active") };
  if (id) {
    // The web address is set once and kept, so links already shared keep working after a rename.
    await db.concern.update({ where: { id }, data });
  } else {
    const base = slugify(name) || "concern";
    let slug = base;
    for (let n = 2; await db.concern.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
    await db.concern.create({ data: { ...data, slug, active: true } });
  }
  revalidatePath("/", "layout");
}

export async function deleteConcern(id: string) {
  await requireArea("concerns");
  await db.concern.delete({ where: { id } });
  revalidatePath("/", "layout");
}

/** Intro text and FAQs shown on the concern’s own page. */
export async function saveConcernContent(id: string, f: FormData) {
  await requireArea("concerns");
  const q = f.getAll("faq_q").map(String);
  const a = f.getAll("faq_a").map(String);
  const faqs = q.map((x, i) => ({ q: x.trim(), a: (a[i] ?? "").trim() })).filter((x) => x.q && x.a);
  const c = await db.concern.update({ where: { id }, data: { intro: str(f, "intro"), faqs } });
  revalidatePath(`/concern/${c.slug}`);
  revalidatePath("/admin/concerns");
}
