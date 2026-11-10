"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { bool, collectImages, int, list, optStr, str } from "@/lib/form";
import { parseVideo } from "@/lib/video";

export async function saveProduct(id: string | null, _prev: string | null, f: FormData): Promise<string | null> {
  await requireArea("products");
  const name = str(f, "name");
  if (!name) return "Enter a product name.";
  const type = str(f, "type");
  if (!type) return "Choose or type a product type.";
  const slug = slugify(str(f, "slug") || name);
  const clash = await db.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return `Another product already uses the web address “${slug}”. Change the URL slug.`;

  // Variants arrive as parallel arrays.
  const vIds = f.getAll("v_id").map(String);
  const vLabels = f.getAll("v_label").map(String);
  const vMrp = f.getAll("v_mrp").map(String);
  const vPrice = f.getAll("v_price").map(String);
  const vStock = f.getAll("v_stock").map(String);
  const vSku = f.getAll("v_sku").map(String);
  const variants = vLabels
    .map((label, i) => ({
      id: vIds[i] || null,
      label: label.trim(),
      mrp: parseInt(vMrp[i], 10),
      price: parseInt(vPrice[i], 10),
      stock: parseInt(vStock[i], 10) || 0,
      sku: vSku[i]?.trim() || null,
      sortOrder: i,
    }))
    .filter((v) => v.label);
  if (!variants.length) return "Add at least one pack size with a price.";
  for (const v of variants) {
    if (!Number.isFinite(v.price) || v.price <= 0) return `Enter a selling price for “${v.label}”.`;
    if (!Number.isFinite(v.mrp) || v.mrp <= 0) v.mrp = v.price;
    if (v.price > v.mrp) return `Selling price can’t be higher than MRP for “${v.label}”.`;
  }

  const faqQ = f.getAll("faq_q").map(String);
  const faqA = f.getAll("faq_a").map(String);
  const faqs = faqQ.map((q, i) => ({ q: q.trim(), a: (faqA[i] ?? "").trim() })).filter((x) => x.q && x.a);
  const concernIds = f.getAll("concerns").map(String);
  const videoUrl = optStr(f, "videoUrl");
  if (videoUrl && !parseVideo(videoUrl)) return "The video link should be a YouTube link (video or Short) or a link to an .mp4 file.";
  const images = await collectImages(f, "images", "products").catch((e: Error) => e);
  if (images instanceof Error) return images.message;

  const data = {
    name,
    slug,
    type,
    brand: optStr(f, "brand"),
    shortDesc: str(f, "shortDesc"),
    description: str(f, "description"),
    ingredients: str(f, "ingredients"),
    dosage: str(f, "dosage"),
    benefits: list(f, "benefits"),
    faqs,
    images,
    videoUrl,
    isActive: bool(f, "isActive"),
    isBestseller: bool(f, "isBestseller"),
    sortOrder: int(f, "sortOrder"),
    seoTitle: optStr(f, "seoTitle"),
    seoDesc: optStr(f, "seoDesc"),
  };

  const saved = await db.$transaction(async (tx) => {
    const p = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });
    const keepIds = variants.map((v) => v.id).filter(Boolean) as string[];
    await tx.variant.deleteMany({ where: { productId: p.id, id: { notIn: keepIds } } });
    for (const v of variants) {
      const { id: vid, ...rest } = v;
      if (vid) await tx.variant.update({ where: { id: vid }, data: rest });
      else await tx.variant.create({ data: { ...rest, productId: p.id } });
    }
    await tx.productOnConcern.deleteMany({ where: { productId: p.id } });
    if (concernIds.length) await tx.productOnConcern.createMany({ data: concernIds.map((concernId) => ({ productId: p.id, concernId })) });
    return p;
  });

  revalidatePath("/", "layout");
  redirect(`/admin/products/${saved.id}?saved=1`);
}

export async function deleteProduct(id: string) {
  await requireArea("products");
  const ordered = await db.orderItem.count({ where: { variant: { productId: id } } });
  if (ordered) {
    // Keep order history intact: hide instead of deleting.
    await db.product.update({ where: { id }, data: { isActive: false } });
  } else {
    await db.product.delete({ where: { id } });
  }
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}

export async function toggleProduct(id: string, isActive: boolean) {
  await requireArea("products");
  await db.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/", "layout");
}

/**
 * “Tidy product photos”: makes already-uploaded product photos square with no white frame.
 * Works through up to 16 photos per click (to stay within hosting time limits); click again for the rest.
 */
export async function tidyProductPhotos() {
  await requireArea("products");
  const { tidyStoredPhoto, TIDY_MARK } = await import("@/lib/product-photo");
  const products = await db.product.findMany({ select: { id: true, images: true } });
  const pending = products.flatMap((p) => p.images.filter((u) => !u.includes(TIDY_MARK) && !/\.svg(\?|$)/i.test(u)).map((u) => ({ id: p.id, url: u })));
  const batch = pending.slice(0, 16);
  let done = 0, failed = 0;
  const replaced = new Map<string, Map<string, string>>();
  for (const { id, url } of batch) {
    try {
      const next = await tidyStoredPhoto(url);
      if (next) {
        if (!replaced.has(id)) replaced.set(id, new Map());
        replaced.get(id)!.set(url, next);
        done++;
      } else failed++;
    } catch {
      failed++;
    }
  }
  for (const [id, map] of replaced) {
    const p = products.find((x) => x.id === id)!;
    await db.product.update({ where: { id }, data: { images: p.images.map((u) => map.get(u) ?? u) } });
  }
  revalidatePath("/", "layout");
  const left = Math.max(0, pending.length - batch.length);
  redirect(`/admin/products?tidied=${done}&left=${left}&skipped=${failed}`);
}
