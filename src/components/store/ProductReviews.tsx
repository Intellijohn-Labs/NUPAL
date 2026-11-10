import Link from "next/link";
import { db } from "@/lib/db";
import { ReviewForm } from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";
import { RatingSummary } from "./RatingSummary";

const FIRST = 5;
const STEP = 10;

type Props = { productId: string; productName: string; slug: string; avg: number; count: number; stars: number | null; show: number };

export async function ProductReviews({ productId, productName, slug, avg, count, stars, show }: Props) {
  const where = { productId, status: "APPROVED" as const, ...(stars ? { rating: stars } : {}) };
  const limit = Math.max(FIRST, Math.min(show, 500));
  const [reviews, total, dist] = await Promise.all([
    db.review.findMany({ where, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: limit }),
    db.review.count({ where }),
    db.review.groupBy({ by: ["rating"], where: { productId, status: "APPROVED" }, _count: true }),
  ]);
  const byStar = (n: number) => dist.find((d) => d.rating === n)?._count ?? 0;
  const href = (s: number | null, n?: number) => {
    const q = new URLSearchParams();
    if (s) q.set("stars", String(s));
    if (n) q.set("show", String(n));
    const qs = q.toString();
    return `/product/${slug}${qs ? `?${qs}` : ""}#reviews`;
  };

  return (
    <section id="reviews" className="mt-16 scroll-mt-28" aria-labelledby="reviews-h">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-h" className="text-[clamp(26px,3vw,36px)]">Customer reviews</h2>
        {count > 0 && <Link href="/reviews" className="text-sm font-medium text-sage hover:underline">Reviews of all products</Link>}
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          {count > 0 ? (
            <RatingSummary avg={avg} count={count} byStar={byStar} hrefFor={(s) => href(s)} active={stars} />
          ) : (
            <p className="text-muted">No reviews yet. Used {productName}? Be the first to share your experience.</p>
          )}
          <ReviewForm productId={productId} productName={productName} />
        </div>
        <div className="flex flex-col gap-4">
          {stars && <p className="text-sm text-muted">Showing {total} {stars}-star {total === 1 ? "review" : "reviews"}</p>}
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id}><ReviewCard r={r} /></li>
            ))}
          </ul>
          {total > reviews.length && (
            <Link href={href(stars, reviews.length + STEP)} scroll={false} className="btn-outline self-start">
              Show more reviews ({total - reviews.length} more)
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
