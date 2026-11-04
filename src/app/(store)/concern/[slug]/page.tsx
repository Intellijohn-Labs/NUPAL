import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { iconPath } from "@/lib/icons";
import { ProductCard } from "@/components/store/ProductCard";
import { ResultsGallery } from "@/components/store/ResultsGallery";
import { VideoTestimonials } from "@/components/store/VideoTestimonials";
import { ReviewCard } from "@/components/store/ReviewCard";
import { DoctorPhoto } from "@/components/store/DoctorPhoto";
import { Reveal } from "@/components/store/Reveal";

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const c = await db.concern.findUnique({ where: { slug: (await params).slug } });
  return c ? { title: `${c.name} – Ayurvedic care`, description: c.intro ? c.intro.replace(/[*#_[\]()]/g, "").slice(0, 155) : undefined } : { title: "Not found" };
}

function Heading({ id, eyebrow, title, action }: { id: string; eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[.18em] text-sage">{eyebrow}</p>
        <h2 id={id} className="mt-1.5 text-[clamp(28px,3.2vw,42px)] leading-tight">{title}</h2>
      </div>
      {action}
    </Reveal>
  );
}

export default async function ConcernPage({ params }: { params: P }) {
  const concern = await db.concern.findUnique({ where: { slug: (await params).slug } });
  if (!concern || !concern.active) notFound();
  const lower = concern.name.toLowerCase();

  const [products, results, videos, doctors] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, concerns: { some: { concernId: concern.id } } },
      include: cardInclude,
      orderBy: [{ isBestseller: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.result.findMany({
      where: { status: "PUBLISHED", consent: true, concernIds: { has: concern.id } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, patientId: true, beforeUrl: true, afterUrl: true, imageUrl: true },
    }),
    db.testimonial.findMany({
      where: { active: true, concernIds: { has: concern.id } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    db.doctor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
  ]);
  const productIds = products.map((p) => p.id);
  const [reviews, reviewAgg] = productIds.length
    ? await Promise.all([
        db.review.findMany({
          where: { status: "APPROVED", productId: { in: productIds } },
          include: { product: { select: { name: true, slug: true } } },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: 6,
        }),
        db.review.aggregate({ where: { status: "APPROVED", productId: { in: productIds } }, _avg: { rating: true }, _count: true }),
      ])
    : [[], null];
  const faqs = ((Array.isArray(concern.faqs) ? concern.faqs : []) as { q: string; a: string }[]).filter((f) => f?.q && f?.a);

  // Section menu: only sections that have something in them.
  const nav = [
    products.length && { id: "products", label: "Products" },
    results.length && { id: "results", label: "Real results" },
    videos.length && { id: "stories", label: "Stories" },
    reviews.length && { id: "reviews", label: "Reviews" },
    { id: "expert", label: "Ask an expert" },
    faqs.length && { id: "questions", label: "Questions" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <>
      {/* Header */}
      <section className="bg-cream">
        <div className="container-x grid grid-cols-1 items-center gap-8 pb-12 pt-10 sm:pb-14 sm:pt-14 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
              <Link href="/" className="hover:text-ink">Home</Link> / <span className="text-ink">{concern.name}</span>
            </nav>
            <div className="hero-in flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-sage shadow-sm">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={iconPath(concern.icon)} />
                </svg>
              </span>
              <h1 className="text-[clamp(36px,4.6vw,60px)] leading-[1.05]">{concern.name}</h1>
            </div>
            {concern.intro ? (
              <div className="prose-nupal hero-in mt-5 max-w-[60ch] text-[17px]" style={{ animationDelay: ".1s" }}>
                <ReactMarkdown>{concern.intro}</ReactMarkdown>
              </div>
            ) : (
              <p className="hero-in mt-5 max-w-[56ch] text-lg leading-8 text-muted" style={{ animationDelay: ".1s" }}>
                Ayurvedic medicines, real results and expert advice for {lower} — all in one place.
              </p>
            )}
          </div>
          <div className="hero-in flex flex-wrap gap-3 lg:justify-end" style={{ animationDelay: ".2s" }}>
            {[
              [String(products.length), products.length === 1 ? "product" : "products"],
              ...(results.length ? [[String(results.length), results.length === 1 ? "real result" : "real results"]] : []),
              ...(reviewAgg && reviewAgg._count ? [[`${(reviewAgg._avg.rating ?? 0).toFixed(1)}★`, `from ${reviewAgg._count} reviews`]] : []),
            ].map(([n, l]) => (
              <div key={l} className="min-w-[120px] rounded-2xl bg-white px-5 py-4">
                <p className="font-display text-3xl">{n}</p>
                <p className="text-sm text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section menu */}
      <nav aria-label="On this page" className="sticky top-[129px] z-30 border-b border-line bg-white/95 backdrop-blur lg:top-[121px]">
        <ul className="container-x no-scrollbar flex gap-1 overflow-x-auto py-2">
          {nav.map((n) => (
            <li key={n.id} className="shrink-0">
              <a href={`#${n.id}`} className="block rounded-full px-4 py-2 text-[15px] text-muted transition-colors hover:bg-cream hover:text-ink">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Products */}
      <section id="products" aria-labelledby="products-h" className="container-x scroll-mt-48 py-16 sm:py-20">
        <Heading id="products-h" eyebrow="Ayurvedic medicines" title={`Products for ${lower}`} />
        {products.length ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} index={i % 4} className="h-full">
                <ProductCard p={toCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-muted">Products for {lower} are being added. Our experts can suggest what suits you meanwhile.</p>
        )}
      </section>

      {/* Real results */}
      {results.length > 0 && (
        <section id="results" aria-labelledby="results-h" className="scroll-mt-48 bg-cream py-16 sm:py-20">
          <div className="container-x">
            <Heading
              id="results-h"
              eyebrow="Real results"
              title="Before and after"
              action={<Link href="/results" className="font-medium text-sage hover:underline">See all results →</Link>}
            />
            <ResultsGallery items={results} step={6} />
            <p className="mt-6 text-xs text-muted">Results may vary from person to person.</p>
          </div>
        </section>
      )}

      {/* Video stories */}
      {videos.length > 0 && (
        <section id="stories" aria-labelledby="stories-h" className="scroll-mt-48 pt-16 sm:pt-20">
          <div className="container-x">
            <Heading id="stories-h" eyebrow="Customer stories" title="Stories from people like you" />
          </div>
          <VideoTestimonials items={videos} step={6} heading={false} />
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section id="reviews" aria-labelledby="reviews-h" className="container-x scroll-mt-48 py-16 sm:py-20">
          <Heading
            id="reviews-h"
            eyebrow={reviewAgg ? `${(reviewAgg._avg.rating ?? 0).toFixed(1)} average · ${reviewAgg._count} reviews` : "Reviews"}
            title={`What customers say about our ${lower} products`}
            action={<Link href="/reviews" className="font-medium text-sage hover:underline">Read all reviews →</Link>}
          />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <li key={r.id}>
                <Reveal index={i % 3} className="h-full">
                  <ReviewCard r={r} clamp />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ask an expert */}
      <section id="expert" aria-labelledby="expert-h" className="relative scroll-mt-48 overflow-hidden bg-forest text-cream">
        <svg viewBox="0 0 560 300" className="pointer-events-none absolute -right-10 bottom-0 w-[560px] opacity-[.18]" aria-hidden="true">
          <g fill="none" stroke="#C9D4C8" strokeWidth="2">
            <path d="M40 160L280 30l240 130M10 200l90-48h360l90 48M100 200v100M180 200v100M380 200v100M460 200v100M60 300h440M230 300v-70h100v70" />
          </g>
        </svg>
        <div className="container-x relative grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.2fr_.8fr]">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[.18em] text-gold">Personal guidance</p>
            <h2 id="expert-h" className="mt-2 text-[clamp(30px,3.6vw,46px)] leading-tight">Ask an Ayurvedic expert about {lower}</h2>
            <p className="mt-4 max-w-[48ch] text-lg font-light leading-8 text-[#c9d4c8]">
              Every person is different. Tell our experts about your {lower} concern and get advice on the right medicines for you — by video, phone or at our Kochi clinic.
            </p>
            <Link href={`/consult?concern=${encodeURIComponent(concern.name)}`} className="btn-gold mt-7">
              Book a consultation
            </Link>
          </Reveal>
          {doctors.length > 0 && (
            <ul className="flex flex-col gap-3">
              {doctors.map((d, i) => (
                <li key={d.id}>
                  <Reveal index={i} from="left">
                    <div className="flex items-center gap-4 rounded-2xl bg-[#F7F4EE] p-3.5 text-ink">
                      {d.photo ? (
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                          <Image src={d.photo} alt="" fill sizes="64px" className="object-cover object-top" />
                        </span>
                      ) : (
                        <DoctorPhoto src={null} name={d.name} size={64} />
                      )}
                      <span>
                        <span className="block font-display text-lg">{d.name}</span>
                        <span className="text-sm text-muted">{d.qualifications}{d.experience ? ` · ${d.experience}` : ""}</span>
                      </span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Questions */}
      {faqs.length > 0 && (
        <section id="questions" aria-labelledby="questions-h" className="container-x max-w-[860px] scroll-mt-48 py-16 sm:py-20">
          <Heading id="questions-h" eyebrow="Good to know" title={`Questions about ${lower}`} />
          <div className="flex flex-col gap-2">
            {faqs.map((f, i) => (
              <Reveal key={i} index={i % 4}>
                <details className="group rounded-2xl bg-cream px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {f.q}
                    <span aria-hidden="true" className="text-xl text-sage transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 whitespace-pre-line leading-7 text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
