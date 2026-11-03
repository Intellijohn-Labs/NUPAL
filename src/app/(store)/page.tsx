import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { BannerSlider } from "@/components/store/BannerSlider";
import { ConcernShop } from "@/components/store/ConcernShop";
import { iconPath } from "@/lib/icons";
import { getSettings } from "@/lib/settings";
import { DoctorPhoto } from "@/components/store/DoctorPhoto";
import { VideoTestimonials } from "@/components/store/VideoTestimonials";
import { HomeReviews } from "@/components/store/HomeReviews";
import { ResultsSection } from "@/components/store/ResultsSection";
import { Reveal } from "@/components/store/Reveal";

export default async function HomePage() {
  const [banners, concerns, products, doctors, types, videos, settings] = await Promise.all([
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
    getSettings(),
  ]);
  const why = (Array.isArray(settings.whyPoints) ? (settings.whyPoints as { title?: string; text?: string }[]) : [])
    .filter((w) => w?.title)
    .map((w) => ({ title: String(w.title), text: String(w.text ?? "") }));
  // Products shown in the hero composition: bestsellers first, those with photos preferred.
  // Hero composition always uses the drawn product art (not uploaded photos), so it stays consistent.
  const heroProducts = products.slice(0, 3).map((p) => ({ name: p.name, type: p.type, image: null }));

  return (
    <>
      <BannerSlider banners={banners} products={heroProducts} trust={why.length >= 4 ? [why[1].title, why[3].title] : why.slice(0, 2).map((w) => w.title)} />
      <ConcernShop
        products={products.map(toCard)}
        concerns={concerns.map((c) => ({ id: c.id, name: c.name, slug: c.slug, iconPath: iconPath(c.icon) }))}
      />

      <ResultsSection />

      <VideoTestimonials items={videos} limit={6} />

      {doctors.length > 0 && (
        <section className="relative overflow-hidden bg-forest text-cream" aria-labelledby="consult">
          <svg viewBox="0 0 560 300" className="pointer-events-none absolute -right-10 bottom-0 w-[620px] opacity-[.18]" aria-hidden="true">
            <g fill="none" stroke="#C9D4C8" strokeWidth="2">
              <path d="M40 160L280 30l240 130M10 200l90-48h360l90 48M100 200v100M180 200v100M380 200v100M460 200v100M60 300h440M230 300v-70h100v70" />
            </g>
          </svg>
          <div className="container-x relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:gap-14">
            <div className="flex flex-col items-start">
              <Reveal><p className="text-xs font-medium uppercase tracking-[.18em] text-gold">Personal guidance</p></Reveal>
              <Reveal index={1}>
                <h2 id="consult" className="mt-2 text-[clamp(32px,3.8vw,50px)] leading-[1.08]">
                  Consult our
                  <br />
                  Ayurvedic experts
                </h2>
              </Reveal>
              <Reveal index={2}>
                <p className="mt-5 max-w-[46ch] text-lg font-light leading-8 text-[#c9d4c8]">
                  Tell us your concern and get the right care for you — by video, phone or at our Kochi clinic. No account needed.
                </p>
              </Reveal>
              <Reveal index={3}>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {types.map((t) => (
                    <li key={t.id} className="rounded-full border border-white/20 bg-white/[.06] px-4 py-2.5 text-sm">
                      {t.name} · {t.durationMin} min
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal index={4}>
                <Link href="/consult" className="btn-gold mt-8">
                  Book a consultation
                </Link>
              </Reveal>
            </div>
            <ul className={`grid gap-4 sm:gap-5 ${doctors.length === 1 ? "max-w-xs" : "grid-cols-2"}`}>
              {doctors.slice(0, 4).map((d, i) => (
                <li key={d.id}>
                  <Reveal index={i} className="h-full">
                    <Link
                      href="/consult"
                      className="flex h-full flex-col overflow-hidden rounded-3xl bg-[#F7F4EE] text-ink transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-26px_rgba(0,0,0,.6)]"
                    >
                      <span className={`relative block aspect-[4/5] ${i % 2 ? "bg-[#F1E7D6]" : "bg-[#E6EDE2]"}`}>
                        {d.photo ? (
                          // object-top keeps the face in view whatever the photo’s shape
                          <Image src={d.photo} alt={d.name} fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover object-top" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <DoctorPhoto src={null} name={d.name} size={120} />
                          </span>
                        )}
                      </span>
                      <span className="flex flex-1 flex-col px-4 pb-5 pt-4 sm:px-5">
                        <span className="font-display text-lg leading-tight sm:text-[22px]">{d.name}</span>
                        <span className="mt-1 text-[13px] text-muted sm:text-sm">
                          {d.qualifications}
                          {d.experience ? ` · ${d.experience}` : " · Ayurvedic physician"}
                        </span>
                        {d.specialities.length > 0 && <span className="mt-2 text-[13px] text-[#8A5E12]">{d.specialities.slice(0, 3).join(" · ")}</span>}
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <HomeReviews />

      {why.length > 0 && (
        <section className="border-b border-line" aria-label="Why NUPAL">
          <div className={`container-x grid gap-6 py-10 sm:grid-cols-2 ${why.length >= 4 ? "lg:grid-cols-4" : why.length === 3 ? "lg:grid-cols-3" : ""}`}>
            {why.map((w, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#567459" strokeWidth="1.4" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />
                </svg>
                <div>
                  <p className="font-display text-lg">{w.title}</p>
                  {w.text && <p className="text-sm text-muted">{w.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
