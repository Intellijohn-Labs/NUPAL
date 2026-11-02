import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseVideo, youtubeThumb } from "@/lib/video";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmButton } from "@/components/admin/ui";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { deleteTestimonial } from "./actions";

export default async function TestimonialsPage() {
  await requireArea("testimonials");
  const [items, products] = await Promise.all([
    db.testimonial.findMany({ include: { product: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    db.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader title="Video testimonials" subtitle="Shown on the homepage as “Stories from our customers”. The homepage shows the first 6, in order; all of them are on the Customer stories page. Name, town, product and quote appear when visitors tap the “i” on a video." />
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-3">
          {items.map((t) => {
            const v = parseVideo(t.videoUrl);
            const cover = t.thumbnail || (v?.kind === "youtube" ? youtubeThumb(v.id) : null);
            return (
              <details key={t.id} className="a-card">
                <summary className="flex cursor-pointer list-none items-center gap-4">
                  {cover ? <img src={cover} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-20 shrink-0 rounded-lg bg-[#e6efe9]" />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t.name}{t.place ? `, ${t.place}` : ""}</span>
                    <span className="block truncate text-sm text-[#56685d]">{t.quote || t.videoUrl}</span>
                  </span>
                  <span className="text-sm text-[#56685d]">{t.active ? "Showing" : "Hidden"} · {t.sortOrder}</span>
                </summary>
                <div className="mt-4 border-t border-[#e8eeea] pt-4">
                  <TestimonialForm t={t} products={products} />
                  <form action={deleteTestimonial.bind(null, t.id)} className="mt-3"><ConfirmButton message="Delete this video testimonial?">Delete</ConfirmButton></form>
                </div>
              </details>
            );
          })}
          {!items.length && <p className="a-card text-[#56685d]">No videos yet. Add the first one using the form.</p>}
        </div>
        <section className="a-card">
          <h2 className="mb-4 font-sans text-lg font-semibold">Add a video</h2>
          <TestimonialForm products={products} next={items.length + 1} />
        </section>
      </div>
    </>
  );
}
