import Link from "next/link";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { BannerSlider } from "@/components/store/BannerSlider";
import { ConcernShop } from "@/components/store/ConcernShop";
import { iconPath } from "@/lib/icons";
import { DoctorPhoto } from "@/components/store/DoctorPhoto";
import { VideoTestimonials } from "@/components/store/VideoTestimonials";
import { HomeReviews } from "@/components/store/HomeReviews";
import { ResultsSection } from "@/components/store/ResultsSection";
import { Reveal } from "@/components/store/Reveal";

export default async function HomePage() {
  const [banners, concerns, products, doctors, types, videos] = await Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.concern.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.product.findMany({
      where: { isActive: true },
      include: cardInclude,
      orderBy: [{ isBestseller: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.doctor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.consultationType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ where: { active: true }, include: { product: { select: { name: true, slug: true } } }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <>
      <BannerSlider banners={banners} />
      <ConcernShop
        products={products.map(toCard)}
        concerns={concerns.map((c) => ({ id: c.id, name: c.name, slug: c.slug, iconPath: iconPath(c.icon) }))}
      />

      <ResultsSection />

      <VideoTestimonials items={videos} limit={6} />

      {doctors.length > 0 && (
        <section className="relative overflow-hidden bg-forest text-cream" aria-labelledby="consult">
          <svg viewBox="0 0 560 300" className="pointer-events-none absolute -right-10 bottom-0 w-[620px] opacity-15" aria-hidden="true">
            <g fill="none" stroke="#C9D4C8" strokeWidth="2">
              <path d="M40 160L280 30l240 130M10 200l90-48h360l90 48M100 200v100M180 200v100M380 200v100M460 200v100M60 300h440M230 300v-70h100v70" />
            </g>
          </svg>
          <div className="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[.9fr_1.1fr]">
            <div className="flex flex-col gap-3">
              {doctors.map((d, i) => (
                <Reveal key={d.id} index={i} from="left">
                <div className="flex items-center gap-4 rounded-2xl bg-cream p-4 text-ink">
                  <DoctorPhoto src={d.photo} name={d.name} size={72} />
                  <div>
                    <p className="font-display text-xl">{d.name}</p>
                    <p className="text-sm text-muted">
                      {d.qualifications}
                      {d.experience ? ` · ${d.experience}` : ""}
                    </p>
                  </div>
                </div>
                </Reveal>
              ))}
            </div>
            <div className="flex flex-col items-start gap-6">
              <h2 id="consult" className="text-[clamp(30px,3.4vw,46px)] leading-tight">
                Talk to our Ayurvedic doctors
              </h2>
              <p className="max-w-[52ch] text-lg leading-8 text-[#c9d4c8]">
                Get advice for your health concern and the right medicines for you. Pick a time that suits you — no account needed.
              </p>
              <ul className="flex flex-wrap gap-3">
                {types.map((t) => (
                  <li key={t.id} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                    <span className="block font-medium">{t.name}</span>
                    <span className="text-sm text-[#c9d4c8]">{t.durationMin} min</span>
                  </li>
                ))}
              </ul>
              <Link href="/consult" className="btn-gold">
                Book a consultation
              </Link>
            </div>
          </div>
        </section>
      )}

      <HomeReviews />

      <section className="border-b border-line" aria-label="Why NUPAL">
        <div className="container-x grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Generations of practice", "Classical and proprietary Ayurvedic formulations"],
            ["GMP · WHO-GMP · ISO 9001", "Certified manufacturing in Kochi"],
            ["Doctor support", "Consult our physicians before you buy"],
            ["Cash on delivery", "Pay when your order arrives"],
          ].map(([t, s]) => (
            <div key={t} className="flex items-start gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#567459" strokeWidth="1.4" aria-hidden="true" className="mt-0.5 shrink-0">
                <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />
              </svg>
              <div>
                <p className="font-display text-lg">{t}</p>
                <p className="text-sm text-muted">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
