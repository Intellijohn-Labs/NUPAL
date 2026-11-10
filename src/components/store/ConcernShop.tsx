"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProductCard, type CardProduct } from "./ProductCard";
import { Reveal } from "./Reveal";
import { TornEdge } from "./TornEdge";

// Each concern gets its own colour from the Kerala palette (background tint, icon colour).
const RING_COLOURS: [string, string][] = [
  ["#E3F1DA", "#3E7B2C"],
  ["#FEF1E9", "#B5562C"],
  ["#FDE4E4", "#B23A3A"],
  ["#E4DAFD", "#6B4FB0"],
  ["#D9F0D4", "#2F7A3A"],
  ["#FCE3EF", "#A73E73"],
  ["#FFF0D6", "#A45F12"],
  ["#E8EEF9", "#3E5F96"],
];

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
      <nav id="shop-by-concern" aria-labelledby="find-care" className="pt-8 sm:pt-10">
        <Reveal className="container-x text-center">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-brick">Shop by health concern</p>
          <h2 id="find-care" className="mt-1.5 text-[clamp(28px,3.6vw,46px)] leading-tight">Find care for…</h2>
        </Reveal>
        <div role="group" className="no-scrollbar container-x flex snap-x snap-mandatory gap-1 overflow-x-auto py-5">
          {items.map((c, idx) => {
            const on = active === c.id;
            const [tint, ink] = RING_COLOURS[idx % RING_COLOURS.length];
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => pick(c.id)}
                className="group flex min-w-[84px] flex-1 snap-start flex-col items-center gap-2.5 rounded-xl px-1 py-1 text-center text-[13px] sm:min-w-[104px] sm:text-sm"
              >
                <span className={`flex h-16 w-16 items-center justify-center rounded-full transition-[background-color,transform] duration-300 group-hover:-translate-y-1 sm:h-[72px] sm:w-[72px] ${on ? "bg-forest" : ""}`} style={on ? undefined : { background: tint }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={on ? "#fff" : ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={c.iconPath} />
                  </svg>
                </span>
                <span className={`leading-tight ${on ? "font-semibold text-forest" : ""}`}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <section className="relative mt-10 scroll-mt-28 bg-blush pb-14 pt-12 sm:mt-14 sm:pb-16 sm:pt-14" aria-labelledby="shop-heading" ref={gridRef} id="bestsellers">
        <TornEdge fill="#FDEDEA" at="top" />
        <TornEdge fill="#FDEDEA" at="bottom" />
        <div className="container-x">
          <div className="mb-7 text-center">
            <h2 id="shop-heading" className="text-[clamp(28px,3.6vw,46px)] leading-tight" aria-live="polite">
              {concern ? concern.name : "Best Sellers"}
            </h2>
            <p className="mt-1 text-muted">
              {concern ? `${matching.length} ${matching.length === 1 ? "product" : "products"}` : "Our most loved formulas"}
            </p>
            {concern && matching.length > 0 && (
              <Link href={`/concern/${concern.slug}`} className="mt-2 inline-block font-medium text-brick underline-offset-4 hover:underline">
                See everything for {concern.name} →
              </Link>
            )}
          </div>

          {list.length > 0 ? (
            <div key={active} className="fade-in no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {list.map((p) => (
                <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-auto">
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-2xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg">{concern?.name} products are being added. Our experts can suggest what suits you meanwhile.</p>
              <Link href="/consult" className="btn-primary shrink-0">Talk to an expert</Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/shop" className="font-medium text-brick underline-offset-4 hover:underline">View all products →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
