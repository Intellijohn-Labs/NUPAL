import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { CardProduct } from "@/components/store/ProductCard";

export const cardInclude = {
  variants: { orderBy: { sortOrder: "asc" } },
  concerns: { select: { concernId: true } },
} satisfies Prisma.ProductInclude;

type WithVariants = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCard(p: WithVariants): CardProduct & { concernIds: string[] } {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    brand: p.brand,
    shortDesc: p.shortDesc,
    image: p.images[0] ?? null,
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
