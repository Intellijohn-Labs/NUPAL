import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ingredientList } from "@/lib/ingredients";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductBuyBox } from "@/components/store/ProductBuyBox";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductReviews } from "@/components/store/ProductReviews";
import { Stars } from "@/components/store/Stars";

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

export default async function ProductPage({ params, searchParams }: { params: P; searchParams: Promise<{ stars?: string; show?: string }> }) {
  const p = await load((await params).slug);
  const sp = await searchParams;
  const starsN = Number(sp.stars);
  const stars = starsN >= 1 && starsN <= 5 ? starsN : null;
  const show = Number(sp.show) || 5;
  if (!p || !p.isActive) notFound();
  const faqs = (Array.isArray(p.faqs) ? p.faqs : []) as { q: string; a: string }[];
  const related = await db.product.findMany({
    where: { isActive: true, id: { not: p.id }, concerns: { some: { concernId: { in: p.concerns.map((c) => c.concernId) } } } },
    include: cardInclude,
    take: 4,
  });

  return (
    <div className="container-x py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
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

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={p.images} name={p.name} type={p.type} videoUrl={p.videoUrl} />
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-muted">
              {p.type}
              {p.brand ? ` · ${p.brand}` : ""}
            </p>
            <h1 className="mt-1 text-[clamp(30px,3.4vw,44px)] leading-tight">{p.name}</h1>
            {p.shortDesc && <p className="mt-2 text-lg text-muted">{p.shortDesc}</p>}
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              {p.ratingCount > 0 ? (
                <>
                  <Stars value={p.ratingAvg} /> {p.ratingAvg.toFixed(1)} · {p.ratingCount} {p.ratingCount === 1 ? "review" : "reviews"}
                </>
              ) : (
                "Be the first to review"
              )}
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.concerns.map(({ concern }) => (
                <Link key={concern.id} href={`/concern/${concern.slug}`} className="rounded-full bg-mist px-3 py-1 text-sm text-sage-dark">
                  {concern.name}
                </Link>
              ))}
            </div>
          </div>

          <ProductBuyBox
            product={{ slug: p.slug, name: p.name, type: p.type, image: p.images[0] ?? null }}
            variants={p.variants.map((v) => ({ id: v.id, label: v.label, mrp: v.mrp, price: v.price, stock: v.stock }))}
          />

          <Link href="/consult" className="flex items-center gap-3 rounded-xl border border-line bg-cream px-4 py-3 text-[15px] hover:border-sage">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#567459" strokeWidth="1.7" aria-hidden="true">
              <path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2" />
              <circle cx="20" cy="12" r="2" />
            </svg>
            <span>
              Not sure this is right for you? <span className="font-medium text-sage underline">Talk to a doctor</span>
            </span>
          </Link>

          {p.benefits.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl">Benefits</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 rounded-xl border border-line px-3 py-2.5 text-[15px]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#567459" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          {p.description && (
            <section>
              <h2 className="mb-2 text-2xl">About this product</h2>
              <div className="prose-nupal"><ReactMarkdown>{p.description}</ReactMarkdown></div>
            </section>
          )}
          {p.ingredients && (
            <section>
              <h2 className="mb-3 text-2xl">Ingredients</h2>
              <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {ingredientList(p.ingredients).map((x, i) => (
                  <li key={`${i}-${x}`} className="flex items-start gap-2.5 leading-6 text-[#343B35]">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mt-[3px] shrink-0">
                      <path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z" fill="#EAF2E7" stroke="#397C42" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M5 19l9-9" stroke="#397C42" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {p.dosage && (
            <section>
              <h2 className="mb-2 text-2xl">How to use</h2>
              <div className="prose-nupal"><ReactMarkdown>{p.dosage}</ReactMarkdown></div>
            </section>
          )}
        </div>
        {faqs.length > 0 && (
          <section>
            <h2 className="mb-3 text-2xl">Questions</h2>
            <div className="flex flex-col gap-2">
              {faqs.map((f, i) => (
                <details key={i} className="rounded-xl bg-cream px-4 py-3">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 leading-7 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      <ProductReviews productId={p.id} productName={p.name} slug={p.slug} avg={p.ratingAvg} count={p.ratingCount} stars={stars} show={show} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-[clamp(26px,3vw,36px)]">You may also need</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={toCard(r)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
