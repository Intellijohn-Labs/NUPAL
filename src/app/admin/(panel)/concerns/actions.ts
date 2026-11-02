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
