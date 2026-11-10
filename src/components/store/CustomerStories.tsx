import Link from "next/link";
import { db } from "@/lib/db";
import { FeaturedVideo } from "./FeaturedVideo";
import { Reveal } from "./Reveal";
import { TornEdge } from "./TornEdge";

/** “Experiences Shared by Our Customers”: one video and up to three approved reviews, on a peach band. */
export async function CustomerStories() {
  const [video, reviews] = await Promise.all([
    db.testimonial.findFirst({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    db.review.findMany({ where: { status: "APPROVED" }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 3, include: { product: { select: { name: true } } } }),
  ]);
  if (!video && !reviews.length) return null;
  return (
    <section aria-labelledby="stories-h" className="relative mt-14 bg-peach pb-14 pt-12 sm:mt-20 sm:pb-20 sm:pt-14">
      <TornEdge fill="#FEF1E9" at="top" />
      <div className="container-x">
        <Reveal className="text-center">
          <h2 id="stories-h" className="text-[clamp(28px,3.4vw,44px)] leading-tight">Experiences Shared by Our Customers</h2>
          <p className="mx-auto mt-2 max-w-[560px] text-muted">Hear from people who have chosen Nupal as part of their wellness journey.</p>
        </Reveal>
        <div className={`mt-7 grid grid-cols-1 gap-4 sm:gap-5 [&>*]:min-w-0 ${video && reviews.length ? "lg:grid-cols-[1fr_1.15fr]" : ""}`}>
          {video && (
            <Reveal className="h-full">
              <FeaturedVideo name={video.name} place={video.place} quote={video.quote} videoUrl={video.videoUrl} thumbnail={video.thumbnail} />
            </Reveal>
          )}
          {reviews.length > 0 && (
            <div className={`grid gap-3 ${video ? "" : "md:grid-cols-3"}`}>
              {reviews.map((r, i) => (
                <Reveal key={r.id} index={i}>
                  <figure className="m-0 h-full rounded-[18px] bg-white px-5 py-4">
                    <p className="tracking-[2px] text-[#E0A33E]" aria-label={`Rated ${r.rating} out of 5`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
                    <blockquote className="my-1.5 line-clamp-4 leading-7">“{r.body}”</blockquote>
                    <figcaption className="text-[13px] text-muted">
                      {r.name}
                      {r.place ? `, ${r.place}` : ""}
                      {r.verified && <span className="font-semibold text-[#2F6B2F]"> · Verified buyer</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/reviews" className="font-semibold text-brick underline-offset-4 hover:underline">Read more reviews →</Link>
                {video && <Link href="/stories" className="font-semibold text-brick underline-offset-4 hover:underline">More customer stories →</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
