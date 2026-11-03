"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProductCard, type CardProduct } from "./ProductCard";
import { Reveal } from "./Reveal";

type P = CardProduct & { concernIds: string[] };
type Concern = { id: string; name: string; slug: string; iconPath: string };

const SHOW = 8;
const STAR = "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";

/**
 * One “shop by concern” control: the icon row filters the product grid below it.
 * “Bestsellers” (the default) shows bestsellers first; a concern shows its products.
 */
export function ConcernShop({ products, concerns }: { products: P[]; concerns: Concern[] }) {
  const [active, setActive] = useState<string>("best");
  const gridRef = useRef<HTMLDivElement>(null);
  const concern = concerns.find((c) => c.id === active);
  const matching = concern ? products.filter((p) => p.concernIds.includes(concern.id)) : products;
  const list = matching.slice(0, SHOW);

  function pick(id: string) {
    setActive(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = gridRef.current?.getBoundingClientRect().top ?? 0;
    // Only scroll when the grid heading is off screen.
    if (top > window.innerHeight * 0.6 || top < 0) gridRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const items = [{ id: "best", name: "Bestsellers", slug: "", iconPath: STAR }, ...concerns];

  return (
    <>
      <nav aria-labelledby="find-care" className="bg-white pt-10 sm:pt-12">
        <Reveal className="container-x">
          <p className="text-xs font-medium uppercase tracking-[.18em] text-sage">Shop by health concern</p>
          <h2 id="find-care" className="mt-1.5 text-[clamp(30px,3.6vw,46px)] leading-tight">Find care for…</h2>
        </Reveal>
        <div role="group" className="container-x no-scrollbar flex gap-1 overflow-x-auto py-5">
          {items.map((c) => {
            const on = active === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => pick(c.id)}
                className="group flex min-w-[104px] flex-1 flex-col items-center gap-2.5 rounded-xl px-2 py-1 text-center text-sm"
              >
                <span className={`flex h-[72px] w-[72px] items-center justify-center rounded-full transition-[background-color,transform] duration-300 group-hover:-translate-y-1 ${on ? "bg-forest" : "bg-[#f1eee7] group-hover:bg-mist"}`}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={on ? "#fff" : "#3E5A42"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={c.iconPath} />
                  </svg>
                </span>
                <span className={`leading-tight ${on ? "font-semibold text-sage-dark" : ""}`}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <section className="container-x scroll-mt-28 py-14 sm:py-16" aria-labelledby="shop-heading" ref={gridRef} id="bestsellers">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.18em] text-sage">{concern ? "Shop by health concern" : "Loved by our customers"}</p>
            <h2 id="shop-heading" className="mt-1.5 text-[clamp(30px,3.6vw,46px)] leading-tight" aria-live="polite">
              {concern ? concern.name : "Bestsellers"}
            </h2>
            <p className="mt-1 text-muted">
              {concern
                ? `${matching.length} ${matching.length === 1 ? "product" : "products"}`
                : "Classical and proprietary Ayurvedic medicines, made in Kochi."}
            </p>
          </div>
          {concern && matching.length > 0 && (
            <Link href={`/concern/${concern.slug}`} className="font-medium text-sage underline-offset-4 hover:underline">
              See everything for {concern.name} →
            </Link>
          )}
        </div>

        {list.length > 0 ? (
          <div key={active} className="fade-in grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-2xl bg-cream p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">{concern?.name} products are being added. Our doctor can suggest what suits you meanwhile.</p>
            <Link href="/consult" className="btn-primary shrink-0">Talk to a doctor</Link>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/shop" className="btn-outline">View all products</Link>
        </div>
      </section>
    </>
  );
}
