import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { BannerForm } from "@/components/admin/BannerForm";
import { ConfirmButton } from "@/components/admin/ui";
import { deleteBanner, saveBanner } from "./actions";

export default async function BannersPage() {
  await requireArea("banners");
  const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Homepage banners" subtitle="Banners rotate at the top of the homepage." />
      <div className="flex flex-col gap-4">
        {banners.map((b) => (
          <details key={b.id} className="a-card">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <span className="font-semibold">{b.title}</span>
              <span className="flex items-center gap-3 text-sm text-[#56685d]">{b.imageDesktop && <img src={b.imageDesktop} alt="" className="h-10 w-24 rounded object-cover" />}{b.imageDesktop ? "Image" : "Text"} banner · {b.active ? "showing" : "hidden"} · order {b.sortOrder}</span>
            </summary>
            <div className="mt-4 border-t border-[#e8eeea] pt-4">
              <BannerForm b={b} next={banners.length + 1} action={saveBanner.bind(null, b.id)} />
              <form action={deleteBanner.bind(null, b.id)} className="mt-3">
                <ConfirmButton message="Delete this banner?">Delete banner</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
        <section className="a-card">
          <h2 className="mb-4 font-sans text-lg font-semibold">Add a banner</h2>
          <BannerForm next={banners.length + 1} action={saveBanner.bind(null, null)} />
        </section>
      </div>
    </>
  );
}
