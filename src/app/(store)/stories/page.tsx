import type { Metadata } from "next";
import { db } from "@/lib/db";
import { VideoTestimonials } from "@/components/store/VideoTestimonials";

export const metadata: Metadata = {
  title: "Customer stories",
  description: "Video stories from customers of NUPAL Remedies’ Ayurvedic medicines.",
};

export default async function StoriesPage() {
  const videos = await db.testimonial.findMany({
    where: { active: true },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return (
    <div className="bg-cream">
      <div className="container-x py-10 sm:py-14">
        <h1 className="text-[clamp(32px,4vw,48px)]">Customer stories</h1>
        <p className="mt-2 text-muted">Real people, in their own words. Tap the <span className="font-serif italic">i</span> on a video for details.</p>
      </div>
      {videos.length ? (
        <VideoTestimonials items={videos} step={9} heading={false} />
      ) : (
        <p className="container-x pb-16 text-muted">Videos are coming soon.</p>
      )}
    </div>
  );
}
