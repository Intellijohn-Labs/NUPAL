import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { CardProduct } from "@/components/store/ProductCard";

export const cardInclude = {
  variants: { orderBy: { sortOrder: "asc" } },
  concerns: { select: { concernId: true, concern: { select: { name: true, sortOrder: true } } } },
} satisfies Prisma.ProductInclude;

type WithVariants = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCard(p: WithVariants): CardProduct & { concernIds: string[] } {
  const firstConcern = [...p.concerns].sort((a, b) => a.concern.sortOrder - b.concern.sortOrder)[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    brand: p.brand,
    shortDesc: p.shortDesc,
    image: p.images[0] ?? null,
    image2: p.images[1] ?? null,
    benefits: p.benefits.slice(0, 3),
    concernName: firstConcern?.concern.name ?? null,
    isBestseller: p.isBestseller,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    variants: p.variants.map((v) => ({ id: v.id, label: v.label, mrp: v.mrp, price: v.price, stock: v.stock })),
    concernIds: p.concerns.map((c) => c.concernId),
  };
}

export async function productTypes() {
  const rows = await db.product.findMany({ where: { isActive: true }, distinct: ["type"], select: { type: true }, orderBy: { type: "asc" } });
  return rows.map((r) => r.type);
}
