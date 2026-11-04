"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { inr, pctOff } from "@/lib/format";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { Stars } from "./Stars";

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
const TINTS = ["#E3EDE0", "#F3E7D3", "#F3E0DC", "#DFE8F1", "#F2E2E7", "#E2EFE3", "#F5E6DA"];
const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2322302A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;
const tintFor = (s: string) => TINTS[[...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TINTS.length];

function Photo({ p, sizes, className = "" }: { p: CardProduct; sizes: string; className?: string }) {
  return p.image ? (
    <Image src={p.image} alt="" fill sizes={sizes} className={`object-contain ${className}`} />
  ) : (
    <span className="flex h-full w-full scale-[.7] items-center justify-center sm:scale-100">
      <ProductArt name={p.name} type={p.type} size={84} />
    </span>
  );
}

export function ProductCard({ p }: { p: CardProduct }) {
  const { add } = useCart();
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
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
    <article className="group flex h-full flex-col rounded-3xl border border-line bg-white p-2.5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_52px_-30px_rgba(31,61,43,.55)]">
      <Link
        href={`/product/${p.slug}`}
        aria-label={p.name}
        className="group/media relative isolate block aspect-square overflow-hidden rounded-[18px] bg-white"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || !hasSecond) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 30) setAlt(dx < 0);
          touchX.current = null;
        }}
      >
        {off > 0 && !out && <span className="absolute left-3 top-3 z-20 rounded-full bg-[#3A9A5B] px-3 py-1 text-xs font-semibold text-white">{off}% OFF</span>}
        {out && <span className="absolute left-3 top-3 z-20 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-white">Out of stock</span>}
        {p.isBestseller && !off && !out && <span className="absolute left-3 top-3 z-20 rounded-full bg-forest px-3 py-1 text-xs font-medium text-cream">Bestseller</span>}

        {/* First view: the product photo */}
        <span className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${firstHidden}`}>
          <Photo p={p} sizes="(max-width: 640px) 50vw, 25vw" className="p-[12%]" />
        </span>

        {/* Second view: the second photo, or an automatic benefits panel */}
        {hasSecond && (
          <span aria-hidden="true" className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${secondShown}`}>
            {p.image2 ? (
              <Image src={p.image2} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center" style={{ background: tintFor(p.name) }}>
                <span className="grid w-[86%] grid-cols-1 items-center gap-[6%] sm:grid-cols-[.8fr_1.2fr]">
                  <span className="relative hidden aspect-[3/4] sm:block">
                    <Photo p={p} sizes="120px" />
                  </span>
                  <span className="flex flex-col gap-2 text-left text-ink">
                    {p.concernName && <span className="font-display text-[clamp(15px,1.3vw,18px)] leading-tight">{p.concernName}</span>}
                    <ul className="grid gap-1.5 text-[clamp(11px,.95vw,13px)] leading-snug">
                      {panelText.slice(0, 3).map((b) => (
                        <li key={b} className="flex items-start gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#567459" strokeWidth="2.4" className="mt-px shrink-0" aria-hidden="true">
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
            className="absolute bottom-1 left-1/2 z-20 flex h-8 -translate-x-1/2 items-center gap-1.5 px-3"
          >
            <i className={`block h-1.5 rounded-full transition-all ${alt ? "w-1.5 bg-ink/25" : "w-4 bg-forest"} group-hover/media:w-1.5 group-hover/media:bg-ink/25`} />
            <i className={`block h-1.5 rounded-full transition-all ${alt ? "w-4 bg-forest" : "w-1.5 bg-ink/25"} group-hover/media:w-4 group-hover/media:bg-forest`} />
          </button>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5 text-center sm:px-2">
        <Link href={`/product/${p.slug}`} className="font-display text-[17px] leading-tight text-ink hover:text-sage sm:text-[19px]">
          {p.name}
        </Link>
        {(p.concernName || p.shortDesc) && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted sm:text-sm">{p.concernName ? `${p.concernName}${p.type ? ` | ${p.type}` : ""}` : p.shortDesc}</p>
        )}
        {p.ratingCount > 0 && (
          <Link href={`/product/${p.slug}#reviews`} className="mt-2 inline-flex items-center justify-center gap-1.5 text-[13px] font-medium sm:text-sm">
            <Stars value={p.ratingAvg} size={14} />
            {p.ratingAvg.toFixed(1)}
            <span className="font-normal text-muted sm:hidden">({p.ratingCount})</span>
            <span className="hidden font-normal text-muted sm:inline">| {p.ratingCount} {p.ratingCount === 1 ? "review" : "reviews"}</span>
          </Link>
        )}
        <div className="my-3 h-px bg-line" />
        {v && (
          <p className="text-lg font-semibold sm:text-xl">
            {inr(v.price)}
            {off > 0 && <s className="ml-1.5 text-sm font-normal text-muted">{inr(v.mrp)}</s>}
          </p>
        )}
        {p.variants.length > 1 ? (
          <>
            <label htmlFor={`pk-${p.id}`} className="sr-only">Pack size for {p.name}</label>
            <select
              id={`pk-${p.id}`}
              value={sel}
              onChange={(e) => setSel(Number(e.target.value))}
              style={{ backgroundImage: SELECT_ARROW, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              className="mx-auto mt-2.5 h-9 appearance-none rounded-full border border-line bg-[#F4F8F2] pl-3.5 pr-8 text-xs font-semibold uppercase tracking-wide"
            >
              {p.variants.map((x, i) => (
                <option key={x.id} value={i}>{x.label}</option>
              ))}
            </select>
          </>
        ) : (
          v && <span className="mx-auto mt-2.5 rounded-full border border-line bg-[#F4F8F2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide">{v.label}</span>
        )}

        <div className="mt-auto grid grid-cols-1 gap-2 pt-3.5 sm:grid-cols-[auto_1fr]">
          <div className="flex h-11 items-center justify-between rounded-xl border border-line bg-[#F7FAF6]" role="group" aria-label={`Quantity of ${p.name}`}>
            <button type="button" aria-label="Decrease quantity" disabled={out} onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-9 text-lg">−</button>
            <span aria-live="polite" className="min-w-5 text-center font-medium">{qty}</span>
            <button type="button" aria-label="Increase quantity" disabled={out} onClick={() => setQty((q) => Math.min(20, q + 1))} className="h-11 w-9 text-lg">+</button>
          </div>
          <button
            type="button"
            disabled={out}
            onClick={() => {
              if (!v) return;
              add({ variantId: v.id, slug: p.slug, name: p.name, label: v.label, price: v.price, type: p.type, image: p.image }, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
            className={`h-11 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition-colors sm:text-[13px] ${out ? "bg-[#8a8f8b]" : added ? "bg-[#3A9A5B]" : "bg-forest hover:bg-[#2E5A3F]"}`}
          >
            {out ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
