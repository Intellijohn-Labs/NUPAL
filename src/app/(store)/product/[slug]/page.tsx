import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ingredientList } from "@/lib/ingredients";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { inr, pctOff } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { ProductTabs } from "@/components/store/ProductTabs";
import { ProductReviews } from "@/components/store/ProductReviews";
import { QuickAdd } from "@/components/store/QuickAdd";
import { Stars } from "@/components/store/Stars";

/**
 * Product page, laid out like the Dr Vaidya's reference the client chose:
 * gallery (left, sticky) · title, benefit chips, rating, price, pack cards, other concerns, quantity + Add to cart,
 * benefit grid, Description / Ingredients / How to use / Details tabs, trust strip, frequently bought together (right) ·
 * full-width story images (admin → product → Story images) · talk to our expert · FAQs · people also bought ·
 * new launches · customer reviews. A slim Add to cart bar sticks to the bottom once the main button scrolls away.
 */

type P = Promise<{ slug: string }>;

async function load(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { sortOrder: "asc" } }, concerns: { include: { concern: true } } },
  });
}

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: p.seoTitle || p.name, description: p.seoDesc || p.shortDesc, openGraph: { images: p.images.slice(0, 1) } };
}

// Shown when a product has no questions of its own.
const GENERAL_FAQS = [
  { q: "Is Cash on Delivery available?", a: "Yes. All orders are Cash on Delivery: you pay when your order arrives." },
  { q: "How soon will my order be dispatched?", a: "Orders are generally dispatched within 2 working days, through reputed national couriers, and delivered Monday to Saturday." },
  { q: "Can I talk to a doctor before buying?", a: "Yes. Our Ayurvedic doctors can help you choose the right medicine. Book a consultation on the Consult a Doctor page." },
  { q: "Can I take this with my other medicines?", a: "Ayurvedic medicines can often be taken alongside other medicines with a gap of about an hour, but please check with your doctor first, especially if you are pregnant, breastfeeding or have a medical condition." },
  { q: "Are NUPAL products made to quality standards?", a: "Yes. Every NUPAL product is made at our own unit in Kochi, which holds GMP, WHO-GMP and ISO 9001:2015 certification." },
];

const CHIP_TONES = ["bg-[#E3F1DE] text-[#2E6B3A]", "bg-[#FBE8D9] text-[#A0521B]", "bg-[#DDEBF7] text-[#2F5F8A]"];

const BENEFIT_ICONS = [
  <path key="a" d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />,
  <path key="b" d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3zM9 12l2 2 4-4" />,
  <path key="c" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  <path key="d" d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
];

const TRUST: [string, React.ReactNode][] = [
  ["Ayurveda since 1960", <path key="a" d="M12 3l2.4 5 5.6.6-4.2 3.8 1.2 5.5L12 15l-5 2.9 1.2-5.5L4 8.6l5.6-.6z" />],
  ["GMP & WHO-GMP certified", <path key="b" d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3zM9 12l2 2 4-4" />],
  ["100% Ayurvedic", <path key="c" d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />],
  ["Free doctor guidance", <path key="d" d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2M20 12a2 2 0 1 0 0-.01" />],
];

function Rail({ id, title, products }: { id: string; title: string; products: ReturnType<typeof toCard>[] }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby={id} className="mt-14 sm:mt-16">
      <h2 id={id} className="mb-5 text-center text-[clamp(26px,3vw,36px)] text-[#174D36]">{title}</h2>
      {/* phones: a swipeable row; desktop: one row of four */}
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:[&>li:nth-child(n+5)]:hidden">
        {products.slice(0, 8).map((p) => (
          <li key={p.id} className="w-[min(70vw,260px)] shrink-0 snap-start lg:w-auto">
            <ProductCard p={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ProductPage({ params, searchParams }: { params: P; searchParams: Promise<{ stars?: string; show?: string }> }) {
  const p = await load((await params).slug);
  const sp = await searchParams;
  const starsN = Number(sp.stars);
  const stars = starsN >= 1 && starsN <= 5 ? starsN : null;
  const show = Number(sp.show) || 5;
  if (!p || !p.isActive) notFound();

  const ownFaqs = (Array.isArray(p.faqs) ? p.faqs : []) as { q: string; a: string }[];
  const faqs = ownFaqs.length ? ownFaqs : GENERAL_FAQS;
  const concernIds = p.concerns.map((c) => c.concernId);

  const [sameConcern, others, newest, allConcerns, doctors, settings] = await Promise.all([
    concernIds.length
      ? db.product.findMany({ where: { isActive: true, id: { not: p.id }, concerns: { some: { concernId: { in: concernIds } } } }, include: cardInclude, take: 8 })
      : Promise.resolve([]),
    db.product.findMany({ where: { isActive: true, id: { not: p.id } }, include: cardInclude, orderBy: [{ isBestseller: "desc" }, { sortOrder: "asc" }], take: 12 }),
    db.product.findMany({ where: { isActive: true, id: { not: p.id } }, include: cardInclude, orderBy: { createdAt: "desc" }, take: 8 }),
    db.concern.findMany({ where: { active: true, products: { some: { product: { isActive: true } } } }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true } }),
    db.doctor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 2, select: { id: true, name: true, photo: true } }),
    getSettings(),
  ]);

  // People also bought: same concern first, then bestsellers.
  const seen = new Set<string>();
  const alsoBought = [...sameConcern, ...others].filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  const together = alsoBought.filter((x) => x.variants.some((v) => v.stock > 0)).slice(0, 2);
  const otherConcerns = allConcerns.filter((c) => !concernIds.includes(c.id)).slice(0, 6);
  const chips = p.benefits.slice(0, 3);
  const ingredients = p.ingredients ? ingredientList(p.ingredients) : [];
  const waDigits = settings.whatsappNumber.replace(/\D/g, "");

  const tabs = [
    (p.description || p.benefits.length > 0) && {
      key: "desc",
      label: "Description",
      content: (
        <>
          {p.benefits.length > 0 && (
            <>
              <p className="font-semibold text-[#22302A]">{p.name} helps with:</p>
              <ul className="mb-3 mt-2 grid gap-1.5">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-[5px] grid h-4 w-4 shrink-0 place-items-center rounded-[4px] bg-[#3E9A4F] text-white">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </>
          )}
          {p.description && <div className="prose-nupal text-[15px]"><ReactMarkdown>{p.description}</ReactMarkdown></div>}
        </>
      ),
    },
    ingredients.length > 0 && {
      key: "ingr",
      label: "Key Ingredients",
      content: (
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ingredients.map((x, i) => (
            <li key={`${i}-${x}`} className="flex items-start gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mt-[5px] shrink-0">
                <path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z" fill="#EAF2E7" stroke="#397C42" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M5 19l9-9" stroke="#397C42" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      ),
    },
    p.dosage && { key: "use", label: "How To Use", content: <div className="prose-nupal text-[15px]"><ReactMarkdown>{p.dosage}</ReactMarkdown></div> },
    {
      key: "details",
      label: "Product Details",
      content: (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-[#6b746e]">Form</dt>
          <dd>{p.type}</dd>
          {p.brand && (
            <>
              <dt className="text-[#6b746e]">Range</dt>
              <dd>{p.brand}</dd>
            </>
          )}
          <dt className="text-[#6b746e]">Pack {p.variants.length > 1 ? "sizes" : "size"}</dt>
          <dd>{p.variants.map((v) => v.label).join(", ")}</dd>
          {p.concerns.length > 0 && (
            <>
              <dt className="text-[#6b746e]">For</dt>
              <dd>{p.concerns.map((c) => c.concern.name).join(", ")}</dd>
            </>
          )}
          <dt className="text-[#6b746e]">Made by</dt>
          <dd>New Udaya Pharmacy &amp; Ayurvedic Laboratories, Kochi, Kerala</dd>
        </dl>
      ),
    },
  ].filter(Boolean) as { key: string; label: string; content: React.ReactNode }[];

  return (
    <div className="pb-24 lg:pb-16">
      <div className="container-x pt-5 sm:pt-7">
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          {p.concerns[0] && (
            <>
              {" / "}
              <Link href={`/concern/${p.concerns[0].concern.slug}`} className="hover:text-ink">{p.concerns[0].concern.name}</Link>
            </>
          )}
          {" / "}
          <span className="text-ink">{p.name}</span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-12">
          {/* gallery */}
          <div className="lg:sticky lg:top-[100px]">
            <ProductGallery images={p.images} name={p.name} type={p.type} videoUrl={p.videoUrl} />
          </div>

          {/* details */}
          <div className="flex min-w-0 flex-col gap-5">
            <div>
              <h1 className="font-sans text-[clamp(24px,2.4vw,32px)] font-semibold leading-tight text-[#22302A]">{p.name}</h1>
              {p.shortDesc && <p className="mt-1.5 text-[15.5px] text-[#5e6862]">{p.shortDesc}</p>}
              {chips.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {chips.map((b, i) => (
                    <li key={b} className={`rounded-md px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[.04em] ${CHIP_TONES[i % CHIP_TONES.length]}`}>{b}</li>
                  ))}
                </ul>
              )}
              <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-[14px] text-[#5e6862] hover:text-ink">
                {p.ratingCount > 0 ? (
                  <>
                    <Stars value={p.ratingAvg} /> <span className="font-medium text-[#22302A]">{p.ratingAvg.toFixed(2)}</span> | {p.ratingCount} {p.ratingCount === 1 ? "review" : "reviews"}
                  </>
                ) : (
                  <>
                    <Stars value={0} /> Be the first to review
                  </>
                )}
              </a>
            </div>

            <ProductPurchase
              product={{ slug: p.slug, name: p.name, type: p.type, image: p.images[0] ?? null }}
              variants={p.variants.map((v) => ({ id: v.id, label: v.label, mrp: v.mrp, price: v.price, stock: v.stock }))}
              otherConcerns={otherConcerns.map((c) => ({ name: c.name, slug: c.slug }))}
            />

            {p.benefits.length > 0 && (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl bg-[#EAF2E7] p-4 sm:p-5">
                {p.benefits.slice(0, 4).map((b, i) => (
                  <li key={b} className="flex items-center gap-3 text-[14px] font-medium leading-snug text-[#22302A]">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#174D36] shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{BENEFIT_ICONS[i % BENEFIT_ICONS.length]}</svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            <ProductTabs tabs={tabs} />

            <ul className="grid grid-cols-2 overflow-hidden rounded-2xl bg-[#174D36] text-center text-white sm:grid-cols-4">
              {TRUST.map(([label, icon], i) => (
                <li key={label} className={`flex flex-col items-center gap-2 px-2 py-4 text-[13px] font-medium leading-tight ${i % 2 ? "border-l border-white/15" : ""} ${i > 1 ? "border-t border-white/15 sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#E7C88F]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
                  {label}
                </li>
              ))}
            </ul>

            {together.length > 0 && (
              <section aria-labelledby="together-h">
                <h2 id="together-h" className="mb-3 font-sans text-[17px] font-semibold text-[#22302A]">Frequently bought together</h2>
                <ul className="flex flex-col gap-3">
                  {together.map((x) => {
                    const v = x.variants.find((y) => y.stock > 0) ?? x.variants[0];
                    const xOff = pctOff(v.mrp, v.price);
                    return (
                      <li key={x.id} className="flex items-center gap-3 rounded-2xl border border-[#E3E8E0] bg-white p-2.5 pr-3">
                        <Link href={`/product/${x.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F1F5EE]">
                          {x.images[0] ? <Image src={x.images[0]} alt="" fill sizes="80px" className="object-contain p-1" /> : <span className="grid h-full place-items-center text-[11px] text-muted">{x.type}</span>}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${x.slug}`} className="line-clamp-2 text-[14.5px] font-medium leading-snug text-[#22302A] hover:text-[#174D36]">{x.name}</Link>
                          <p className="mt-1 text-[14px] font-semibold text-[#174D36]">
                            {inr(v.price)} {xOff > 0 && <s className="ml-1 text-[12.5px] font-normal text-[#8a928c]">{inr(v.mrp)}</s>}
                          </p>
                        </div>
                        <QuickAdd item={{ variantId: v.id, slug: x.slug, name: x.name, label: v.label, price: v.price, type: x.type, image: x.images[0] ?? null }} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* full-width story images */}
      {p.storyImages.length > 0 && (
        <section aria-label={`More about ${p.name}`} className="mt-12 sm:mt-16">
          {p.storyImages.map((src, i) => (
            <Image key={src} src={src} alt={i === 0 ? `More about ${p.name}` : ""} width={2200} height={930} sizes="100vw" className="block h-auto w-full" />
          ))}
        </section>
      )}

      {/* talk to our expert */}
      <section aria-labelledby="expert-h" className="container-x mt-12 sm:mt-16">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#174D36_0%,#1F6347_100%)] px-6 py-9 text-center text-white sm:flex-row sm:px-10 sm:text-left lg:px-14">
          <svg viewBox="0 0 120 220" aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-6 w-28 rotate-[-20deg] opacity-30"><path d="M60 220C8 170 4 80 60 0c56 80 52 170 0 220z" fill="#3E8A47" /></svg>
          {doctors.length > 0 && (
            <div className="flex shrink-0 -space-x-4">
              {doctors.map((d) => (
                <span key={d.id} className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/90 bg-[#EAF2E7] sm:h-28 sm:w-28">
                  {d.photo ? <Image src={d.photo} alt={d.name} fill sizes="112px" className="object-cover object-top" /> : null}
                </span>
              ))}
            </div>
          )}
          <div className="relative flex-1">
            <h2 id="expert-h" className="text-[clamp(26px,3vw,38px)] leading-tight text-white">Talk to our Expert</h2>
            <p className="mt-2 max-w-[520px] text-white/85">Not sure if {p.name} is right for you? Our Ayurvedic doctors can help you choose the right products for your health.</p>
          </div>
          <div className="relative flex w-full flex-col gap-3 sm:w-auto">
            <Link href="/consult" className="inline-flex h-[52px] items-center justify-center rounded-lg bg-[#F4EBD2] px-7 text-[15px] font-semibold uppercase tracking-[.04em] text-[#174D36] hover:bg-white">Take consultation now</Link>
            {waDigits && (
              <a href={`https://wa.me/${waDigits}?text=${encodeURIComponent(`Hello NUPAL, I have a question about ${p.name}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-[52px] items-center justify-center rounded-lg border-[1.5px] border-white/80 px-7 text-[15px] font-medium text-white hover:bg-white/10">
                Ask on WhatsApp<span className="sr-only"> (opens WhatsApp)</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container-x">
        {/* FAQs */}
        <section aria-labelledby="faq-h" className="mx-auto mt-14 max-w-[880px] sm:mt-16">
          <h2 id="faq-h" className="mb-5 text-center text-[clamp(26px,3vw,36px)] text-[#174D36]">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-2.5">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-[#E3E8E0] bg-white px-4 open:bg-[#F7FAF5] sm:px-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-[#22302A] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-[#397C42] transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
                </summary>
                <p className="pb-4 leading-7 text-[#5e6862]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Rail id="also-h" title="People Also Bought These" products={alsoBought.map(toCard)} />
        <Rail id="new-h" title="New Launches" products={newest.map(toCard)} />

        <ProductReviews productId={p.id} productName={p.name} slug={p.slug} avg={p.ratingAvg} count={p.ratingCount} stars={stars} show={show} />
      </div>
    </div>
  );
}
