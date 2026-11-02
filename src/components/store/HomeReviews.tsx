import Link from "next/link";
import { db } from "@/lib/db";
import { Stars } from "./Stars";
import { ReviewCard } from "./ReviewCard";
import { Reveal } from "./Reveal";

export async function HomeReviews() {
  let reviews = await db.review.findMany({ where: { status: "APPROVED", featured: true }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 6 });
  if (!reviews.length)
    reviews = await db.review.findMany({ where: { status: "APPROVED", rating: { gte: 4 } }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 6 });
  if (!reviews.length) return null;
  const all = await db.review.aggregate({ where: { status: "APPROVED" }, _avg: { rating: true }, _count: true });

  return (
    <section className="container-x py-16 sm:py-20" aria-labelledby="home-reviews">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="home-reviews" className="text-[clamp(28px,3.4vw,42px)]">What our customers say</h2>
          <p className="mt-2 flex items-center gap-2 text-muted">
            <Stars value={all._avg.rating ?? 0} /> {(all._avg.rating ?? 0).toFixed(1)} average from {all._count} {all._count === 1 ? "review" : "reviews"}
          </p>
        </div>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.id} index={i % 3} className="h-full">
            <ReviewCard r={r} clamp />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/reviews" className="btn-outline">Read all reviews</Link>
      </div>
    </section>
  );
}
