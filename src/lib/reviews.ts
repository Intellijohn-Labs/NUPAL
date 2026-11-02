import { db } from "./db";

/** Recalculates a product’s average rating and count from its approved reviews. */
export async function recomputeRating(productId: string) {
  const agg = await db.review.aggregate({ where: { productId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
  await db.product.update({
    where: { id: productId },
    data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count },
  });
}
