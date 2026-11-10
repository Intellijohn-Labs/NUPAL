"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { inr, pctOff } from "@/lib/format";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  type: string;
  brand: string | null;
  shortDesc: string;
  image: string | null;
  /** Second photo — shown on hover. Without it, a benefits panel is built from the details below. */
  image2: string | null;
  benefits: string[];
  concernName: string | null;
  isBestseller: boolean;
  ratingAvg: number;
  ratingCount: number;
  variants: { id: string; label: string; mrp: number; price: number; stock: number }[];
};

// Soft background tints for the benefits panel, picked per product so neighbouring cards differ.
const TINTS = ["#E3F6F1", "#FFF4C7", "#FDE4E6", "#E5F0FC", "#EEF8DD", "#F3E8FB", "#FDEBDD"];
const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2322302A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;
const tintFor = (s: string) => TINTS[[...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TINTS.length];

function Photo({ p, sizes, className = "" }: { p: CardProduct; sizes: string; className?: string }) {
  return p.image ? (
    <Image src={p.image} alt="" fill sizes={sizes} className={`object-cover ${className}`} />
  ) : (
    <span className="flex h-full w-full scale-[.7] items-center justify-center sm:scale-100">
      <ProductArt name={p.name} type={p.type} size={84} />
    </span>
  );
}

export function ProductCard({ p }: { p: CardProduct }) {
  const { add } = useCart();
  const [sel, setSel] = useState(0);
  const [added, setAdded] = useState(false);
  const [alt, setAlt] = useState(false); // phones: second view shown after a swipe or a tap on the dots
  const touchX = useRef<number | null>(null);

  const v = p.variants[sel];
  const off = v ? pctOff(v.mrp, v.price) : 0;
  const out = !v || v.stock <= 0;
  const panelText = p.benefits.length ? p.benefits : p.shortDesc ? [p.shortDesc] : [];
  const hasSecond = !!p.image2 || panelText.length > 0;
  const firstHidden = hasSecond ? `group-hover/media:opacity-0 group-hover/media:scale-95 ${alt ? "opacity-0 scale-95" : ""}` : "group-hover/media:scale-105";
  const secondShown = `group-hover/media:opacity-100 group-hover/media:scale-100 ${alt ? "opacity-100 scale-100" : "opacity-0 scale-105"}`;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[#E7E4DA] bg-white p-2 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:border-[#D8D2C2] hover:shadow-[0_22px_40px_-26px_rgba(23,77,54,.45)] sm:p-3">
      <Link
        href={`/product/${p.slug}`}
        aria-label={p.name}
        className="group/media relative isolate block aspect-square overflow-hidden rounded-xl bg-[#F4EFE3]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || !hasSecond) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 30) setAlt(dx < 0);
          touchX.current = null;
        }}
      >
        {off > 0 && !out && <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-[#174D36] px-2.5 py-0.5 text-[11px] font-semibold text-white">{off}% OFF</span>}
        {out && <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-white">Out of stock</span>}
        {p.isBestseller && !off && !out && <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-[#E7C88F] px-2.5 py-0.5 text-[11px] font-medium text-[#174D36]">Bestseller</span>}

        <span className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${firstHidden}`}>
          <Photo p={p} sizes="(max-width: 640px) 50vw, 25vw" />
        </span>

        {hasSecond && (
          <span aria-hidden="true" className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${secondShown}`}>
            {p.image2 ? (
              <Image src={p.image2} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center" style={{ background: tintFor(p.name) }}>
                <span className="grid w-[86%] grid-cols-1 items-center gap-[6%] sm:grid-cols-[.8fr_1.2fr]">
                  <span className="relative hidden aspect-[3/4] overflow-hidden rounded-lg sm:block">
                    <Photo p={p} sizes="120px" />
                  </span>
                  <span className="flex flex-col gap-2 text-left text-ink">
                    {p.concernName && <span className="font-display text-[clamp(15px,1.3vw,18px)] leading-tight">{p.concernName}</span>}
                    <ul className="grid gap-1.5 text-[clamp(11px,.95vw,13px)] leading-snug">
                      {panelText.slice(0, 3).map((b) => (
                        <li key={b} className="flex items-start gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3F9A3A" strokeWidth="2.4" className="mt-px shrink-0" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </span>
                </span>
              </span>
            )}
          </span>
        )}

        {hasSecond && (
          <button
            type="button"
            aria-label={alt ? "Show product photo" : "Show more about this product"}
            onClick={(e) => {
              e.preventDefault();
              setAlt((a) => !a);
            }}
            className="absolute bottom-0.5 left-1/2 z-20 flex h-8 -translate-x-1/2 items-center gap-1.5 px-3"
          >
            <i className={`block h-1.5 rounded-full transition-all ${alt ? "w-1.5 bg-ink/25" : "w-4 bg-[#174D36]"} group-hover/media:w-1.5 group-hover/media:bg-ink/25`} />
            <i className={`block h-1.5 rounded-full transition-all ${alt ? "w-4 bg-[#174D36]" : "w-1.5 bg-ink/25"} group-hover/media:w-4 group-hover/media:bg-[#174D36]`} />
          </button>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3 sm:px-2 sm:pt-4">
        {/* concern pill and pack size */}
        <div className="flex min-h-[26px] flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          {p.concernName ? (
            <span className="max-w-full truncate rounded-full bg-[#EAF2E7] px-2.5 py-1 text-[11px] font-medium text-[#397C42] sm:text-xs">{p.concernName}</span>
          ) : (
            <span />
          )}
          {p.variants.length > 1 ? (
            <>
              <label htmlFor={`pk-${p.id}`} className="sr-only">Pack size for {p.name}</label>
              <select
                id={`pk-${p.id}`}
                value={sel}
                onChange={(e) => setSel(Number(e.target.value))}
                style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
                className="h-7 max-w-full appearance-none rounded-md border border-[#E7E4DA] bg-white pl-2 pr-6 text-xs text-muted"
              >
                {p.variants.map((x, i) => (
                  <option key={x.id} value={i}>{x.label}</option>
                ))}
              </select>
            </>
          ) : (
            v && <span className="hidden shrink-0 text-xs text-muted sm:inline">{v.label}</span>
          )}
        </div>

        <Link href={`/product/${p.slug}`} className="mt-2.5 text-[16px] font-medium leading-snug text-[#174D36] hover:text-[#397C42] sm:text-[20px]">
          {p.name}
        </Link>
        {(p.benefits[0] || p.shortDesc) && <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-[#555E54] sm:text-sm">{p.benefits[0] ?? p.shortDesc}</p>}

        {/* rating: only shown when there are genuine reviews */}
        {p.ratingCount > 0 && (
          <Link href={`/product/${p.slug}#reviews`} className="mt-2.5 flex items-center gap-2 text-xs text-muted sm:text-[13px]" aria-label={`Rated ${p.ratingAvg.toFixed(1)} out of 5 from ${p.ratingCount} reviews`}>
            <span className="tracking-[1px] text-[#E0A33E]" aria-hidden="true">
              {"★".repeat(Math.round(p.ratingAvg))}
              <span className="text-[#E7E4DA]">{"★".repeat(5 - Math.round(p.ratingAvg))}</span>
            </span>
            <span>
              {p.ratingAvg.toFixed(1)} <span className="hidden sm:inline">({p.ratingCount} {p.ratingCount === 1 ? "review" : "reviews"})</span>
            </span>
          </Link>
        )}

        {/* price and Add to Cart: side by side, stacked on narrow phone cards */}
        <div className="mt-auto flex flex-col gap-2.5 pt-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:pt-4">
          {v && (
            <p className="text-[18px] font-semibold leading-none text-[#174D36] sm:text-[22px]">
              {inr(v.price)}
              {off > 0 && <s className="ml-1.5 text-xs font-normal text-muted sm:text-[13px]">{inr(v.mrp)}</s>}
            </p>
          )}
          <button
            type="button"
            disabled={out}
            onClick={() => {
              if (!v) return;
              add({ variantId: v.id, slug: p.slug, name: p.name, label: v.label, price: v.price, type: p.type, image: p.image }, 1);
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
            className={`h-11 shrink-0 rounded-full px-5 text-[13px] font-medium text-white transition-colors sm:h-12 sm:px-6 sm:text-sm ${out ? "cursor-not-allowed bg-[#9a9590]" : added ? "bg-[#397C42]" : "bg-[#174D36] hover:bg-[#397C42]"}`}
          >
            {out ? "Out of stock" : added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
