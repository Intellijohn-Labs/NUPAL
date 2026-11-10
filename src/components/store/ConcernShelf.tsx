"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { iconPath } from "@/lib/icons";
import { ProductCard, type CardProduct } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { ConcernCard } from "./ConcernCards";

type P = CardProduct & { concernIds: string[] };

/**
 * Homepage “Trusted Favourites” with Dr Vaidya’s-style concern pills: one row of large pills
 * (Bestsellers + each concern that has products); tapping one shows that concern’s products below,
 * without leaving the page, with “View all …” to the concern page.
 */
export function ConcernShelf({ concerns, products, bestsellers, joinBelow = false }: { concerns: ConcernCard[]; products: P[]; bestsellers: CardProduct[]; joinBelow?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const shelfRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const withProducts = concerns.filter((c) => products.some((p) => p.concernIds.includes(c.id)));
  const concern = concerns.find((c) => c.id === active) ?? null;
  const list: CardProduct[] = concern ? products.filter((p) => p.concernIds.includes(concern.id)).slice(0, 8) : bestsellers.slice(0, 4);

  function pick(id: string | null, scroll: boolean) {
    auto.current.on = false;
    setActive(id);
    // keep the chosen tab in view in the tab row
    requestAnimationFrame(() => tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${id ?? "best"}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }));
    if (!scroll || !shelfRef.current) return;
    const top = shelfRef.current.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.5 || top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      shelfRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  const tab = (on: boolean) =>
    `flex h-[52px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border px-5 text-[13px] font-semibold uppercase tracking-[.04em] transition-colors sm:h-[60px] sm:gap-3 sm:px-6 sm:text-[15px] ${
      on ? "border-[#3E8E4A] bg-[#3E8E4A] text-white" : "border-[#A9D3A6] bg-[#D6ECD3] text-[#1F2A22] hover:border-[#3E8E4A]"
    }`;

  // arrows for the pill row (desktop), shown only when it can scroll that way
  const [edges, setEdges] = useState({ left: false, right: false });
  const measure = () => {
    const el = tabsRef.current;
    if (el) setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const slide = (dir: number) => {
    stopAuto();
    tabsRef.current?.scrollBy({ left: dir * tabsRef.current.clientWidth * 0.7, behavior: "smooth" });
  };

  // Gentle auto-scroll of the pill row so visitors see every concern. It pauses while the pointer is
  // over the row, and stops for good once the visitor scrolls it, uses the arrows or picks a pill.
  const auto = useRef({ on: true, paused: false });
  const stopAuto = () => {
    auto.current.on = false;
  };
  useEffect(() => {
    const el = tabsRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = 0, wait = 0, pos = el.scrollLeft;
    const SPEED = 28; // px per second
    const step = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 0;
      last = t;
      if (auto.current.on && !auto.current.paused && el.scrollWidth > el.clientWidth + 4) {
        if (wait > 0) wait -= dt;
        else if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
          wait = 1800; // pause at the end, then glide back to the start
          pos = 0;
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          pos += (SPEED * dt) / 1000;
          if (Math.abs(pos - el.scrollLeft) > 40) pos = el.scrollLeft; // visitor moved it
          el.scrollLeft = pos;
        }
      }
      raf = requestAnimationFrame(step);
    };
    const start = setTimeout(() => (raf = requestAnimationFrame(step)), 1500);
    const pause = () => (auto.current.paused = true);
    const resume = () => (auto.current.paused = false);
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("focusin", pause);
    el.addEventListener("focusout", resume);
    el.addEventListener("touchstart", stopAuto, { passive: true });
    el.addEventListener("wheel", stopAuto, { passive: true });
    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("focusout", resume);
      el.removeEventListener("touchstart", stopAuto);
      el.removeEventListener("wheel", stopAuto);
    };
  }, []);

  return (
    <>
      {(bestsellers.length > 0 || withProducts.length > 0) && (
        <section
          ref={shelfRef}
          id="bestsellers"
          aria-labelledby="best-h"
          className={`relative mt-10 scroll-mt-28 bg-blush pt-12 sm:mt-14 sm:pt-14 ${joinBelow ? "pb-12 sm:pb-16" : "mb-14 pb-12 sm:mb-20 sm:pb-16"}`}
        >
          <span id="concerns" className="absolute -top-24" aria-hidden="true" />
          <div className="container-x">
            <Reveal className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-brick">Shop by health concern</p>
              <h2 id="best-h" className="mt-1.5 text-[clamp(28px,3.4vw,44px)] leading-tight">Trusted Favourites, Chosen by You</h2>
              <p className="mx-auto mt-2 max-w-[560px] text-muted">Pick a health concern to see the formulations for it.</p>
            </Reveal>

            {withProducts.length > 0 && (
              <div className="relative -mx-4 mt-7 sm:mx-0">
                <div ref={tabsRef} onScroll={measure} role="group" aria-label="Shop by health concern" className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 sm:px-0">
                  <button type="button" data-tab="best" aria-pressed={!active} onClick={() => pick(null, false)} className={tab(!active)}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sm:h-[30px] sm:w-[30px]">
                      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                    </svg>
                    Bestsellers
                  </button>
                  {withProducts.map((c) => (
                    <button key={c.id} type="button" data-tab={c.id} aria-pressed={active === c.id} onClick={() => pick(c.id, false)} className={tab(active === c.id)}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sm:h-[30px] sm:w-[30px]">
                        <path d={iconPath(c.icon)} />
                      </svg>
                      {c.name}
                    </button>
                  ))}
                </div>
                {edges.left && (
                  <button type="button" onClick={() => slide(-1)} aria-label="Show previous concerns" className="absolute -left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#A9D3A6] bg-white text-[#1F2A22] shadow-md hover:bg-[#F3FAF1] sm:grid">‹</button>
                )}
                {edges.right && (
                  <>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-blush to-transparent" />
                    <button type="button" onClick={() => slide(1)} aria-label="Show more concerns" className="absolute -right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#A9D3A6] bg-white text-[#1F2A22] shadow-md hover:bg-[#F3FAF1] sm:grid">›</button>
                  </>
                )}
              </div>
            )}

            <div key={active ?? "best"} aria-live="polite" className="fade-in mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
            <div className="mt-6 text-center">
              {concern ? (
                <Link href={`/concern/${concern.slug}`} className="font-semibold text-brick underline-offset-4 hover:underline">View all {concern.name} →</Link>
              ) : (
                <Link href="/shop" className="font-semibold text-brick underline-offset-4 hover:underline">View All Products →</Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
