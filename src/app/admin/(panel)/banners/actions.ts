"use server";

import { revalidatePath } from "next/cache";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, collectImages, int, str } from "@/lib/form";

export async function saveBanner(id: string | null, f: FormData) {
  await requireArea("banners");
  const title = str(f, "title");
  if (!title) return;
  const isText = str(f, "kind") === "text";
  const [desktop] = isText ? [] : await collectImages(f, "desktop", "banners");
  const [mobile] = isText ? [] : await collectImages(f, "mobile", "banners");
  const data = {
    title,
    subtitle: str(f, "subtitle"),
    ctaLabel: str(f, "ctaLabel") || "Shop now",
    ctaHref: str(f, "ctaHref") || "/shop",
    theme: str(f, "theme") || "cream",
    sortOrder: int(f, "sortOrder"),
    active: bool(f, "active"),
    imageDesktop: desktop ?? null,
    imageMobile: mobile ?? null,
  };
  if (id) await db.banner.update({ where: { id }, data });
  else await db.banner.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  await requireArea("banners");
  await db.banner.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/banners");
}
