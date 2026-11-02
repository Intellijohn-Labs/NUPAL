"use server";

import { revalidatePath } from "next/cache";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, int, str } from "@/lib/form";

const done = () => {
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
};

export async function saveGroup(id: string | null, f: FormData) {
  await requireArea("pages");
  const name = str(f, "name");
  if (!name) return;
  const data = { name, sortOrder: int(f, "sortOrder"), active: id ? bool(f, "active") : true };
  if (id) await db.menuGroup.update({ where: { id }, data });
  else await db.menuGroup.create({ data });
  done();
}

export async function deleteGroup(id: string) {
  await requireArea("pages");
  await db.menuGroup.delete({ where: { id } });
  done();
}

function cleanHref(h: string) {
  const s = h.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s) || s.startsWith("/") || s.startsWith("#")) return s;
  return "/" + s;
}

export async function saveItem(groupId: string, id: string | null, f: FormData) {
  await requireArea("pages");
  const label = str(f, "label");
  const href = cleanHref(str(f, "href"));
  if (!label || !href) return;
  const data = { label, href, sortOrder: int(f, "sortOrder") };
  if (id) await db.menuItem.update({ where: { id }, data });
  else await db.menuItem.create({ data: { ...data, groupId } });
  done();
}

export async function deleteItem(id: string) {
  await requireArea("pages");
  await db.menuItem.delete({ where: { id } });
  done();
}
