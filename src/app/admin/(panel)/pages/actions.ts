"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { bool, optStr, str } from "@/lib/form";

const RESERVED = new Set(["shop", "cart", "checkout", "consult", "product", "concern", "order", "admin", "api", "uploads", "brand", "reviews", "stories", "results"]);

export async function savePage(id: string | null, _prev: string | null, f: FormData): Promise<string | null> {
  await requireArea("pages");
  const title = str(f, "title");
  if (!title) return "Enter a title.";
  const slug = slugify(str(f, "slug") || title);
  if (RESERVED.has(slug)) return `“${slug}” is used by the website. Choose another URL slug.`;
  const clash = await db.page.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return `Another page already uses “/${slug}”.`;
  const data = { title, slug, content: str(f, "content"), seoDesc: optStr(f, "seoDesc"), published: bool(f, "published"), inFooter: bool(f, "inFooter"), inAboutMenu: bool(f, "inAboutMenu") };
  const page = id ? await db.page.update({ where: { id }, data }) : await db.page.create({ data });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${page.id}?saved=1`);
}

export async function deletePage(id: string) {
  await requireArea("pages");
  await db.page.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}
