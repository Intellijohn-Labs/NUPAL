import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ReviewCard } from "@/components/store/ReviewCard";
import { RatingSummary } from "@/components/store/RatingSummary";
import { ProductFilterSelect } from "@/components/store/ProductFilterSelect";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "Read genuine reviews from customers of NUPAL Remedies’ Ayurvedic medicines.",
};

const FIRST = 12;
const STEP = 12;
type SP = Promise<{ product?: string; stars?: string; sort?: string; show?: string }>;

export default async function ReviewsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const starsN = Number(sp.stars);
  const stars = starsN >= 1 && starsN <= 5 ? starsN : null;
  const sort = sp.sort === "highest" || sp.sort === "lowest" ? sp.sort : "newest";
  const limit = Math.max(FIRST, Math.min(Number(sp.show) || FIRST, 1000));

  const productsWithReviews = await db.product.findMany({
    where: { isActive: true, reviews: { some: { status: "APPROVED" } } },
    select: { id: true, slug: true, name: true },
    orderBy: { name: "asc" },
  });
  const product = productsWithReviews.find((p) => p.slug === sp.product) ?? null;

  const base: Prisma.ReviewWhereInput = { status: "APPROVED", product: { isActive: true }, ...(product ? { productId: product.id } : {}) };
  const where: Prisma.ReviewWhereInput = { ...base, ...(stars ? { rating: stars } : {}) };
  const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
    sort === "highest" ? [{ rating: "desc" }, { createdAt: "desc" }] : sort === "lowest" ? [{ rating: "asc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }];

  const [reviews, total, agg, dist] = await Promise.all([
    db.review.findMany({ where, include: { product: { select: { name: true, slug: true } } }, orderBy, take: limit }),
    db.review.count({ where }),
    db.review.aggregate({ where: base, _avg: { rating: true }, _count: true }),
    db.review.groupBy({ by: ["rating"], where: base, _count: true }),
  ]);
  const byStar = (n: number) => dist.find((d) => d.rating === n)?._count ?? 0;

  const qs = (over: Record<string, string | null>) => {
    const q = new URLSearchParams();
    const cur: Record<string, string | null> = { product: product?.slug ?? null, stars: stars ? String(stars) : null, sort: sort === "newest" ? null : sort, ...over };
    for (const [k, v] of Object.entries(cur)) if (v) q.set(k, v);
    const s = q.toString();
    return `/reviews${s ? `?${s}` : ""}`;
  };
  const baseQuery = new URLSearchParams(Object.entries({ stars: stars ? String(stars) : "", sort: sort === "newest" ? "" : sort }).filter(([, v]) => v)).toString();

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="text-[clamp(32px,4vw,48px)]">Customer reviews</h1>
      <p className="mt-2 text-muted">Genuine reviews from people who use NUPAL’s medicines.</p>

      {agg._count === 0 ? (
        <div className="mt-10 rounded-2xl bg-cream p-8 text-center">
          <p className="text-lg">No reviews yet.</p>
          <p className="mt-1 text-muted">Used one of our products? You can write a review on its product page.</p>
          <Link href="/shop" className="btn-primary mt-5">Browse products</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[320px_1fr]">
          <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
            <RatingSummary avg={agg._avg.rating ?? 0} count={agg._count} byStar={byStar} hrefFor={(s) => qs({ stars: s ? String(s) : null, show: null })} active={stars} />
            {productsWithReviews.length > 1 && <ProductFilterSelect products={productsWithReviews} value={product?.slug ?? ""} baseQuery={baseQuery} />}
            <div>
              <p className="label mb-2">Sort by</p>
              <div className="flex flex-wrap gap-2">
                {[["newest", "Newest"], ["highest", "Highest rated"], ["lowest", "Lowest rated"]].map(([k, l]) => (
                  <Link key={k} href={qs({ sort: k === "newest" ? null : k, show: null })} scroll={false} aria-current={sort === k ? "true" : undefined} className={`chip ${sort === k ? "border-sage bg-mist font-medium" : "border-line"}`}>
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              {total} {total === 1 ? "review" : "reviews"}
              {product ? ` for ${product.name}` : ""}
              {stars ? ` · ${stars} star` : ""}
              {(product || stars) && (
                <>
                  {" · "}
                  <Link href="/reviews" scroll={false} className="font-medium text-sage underline">Clear filters</Link>
                </>
              )}
            </p>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.id}><ReviewCard r={r} /></li>
              ))}
            </ul>
            {total > reviews.length && (
              <Link href={qs({ show: String(reviews.length + STEP) })} scroll={false} className="btn-outline self-center">
                Show more reviews ({total - reviews.length} more)
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
