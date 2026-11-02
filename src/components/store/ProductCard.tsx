"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  isBestseller: boolean;
  ratingAvg: number;
  ratingCount: number;
  variants: { id: string; label: string; mrp: number; price: number; stock: number }[];
};

export function ProductCard({ p }: { p: CardProduct }) {
  const { add } = useCart();
  const [sel, setSel] = useState(0);
  const [added, setAdded] = useState(false);
  const v = p.variants[sel];
  const off = v ? pctOff(v.mrp, v.price) : 0;
  const out = !v || v.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(35,64,46,.6)]">
      <Link href={`/product/${p.slug}`} className="relative flex h-56 items-center justify-center overflow-hidden bg-[#f4f1ea]">
        {off > 0 && !out && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-pestle px-2 py-1 text-xs font-semibold text-white">{off}% off</span>
        )}
        {out && <span className="absolute left-3 top-3 z-10 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-white">Out of stock</span>}
        {p.isBestseller && (
          <span className="absolute right-3 top-3 z-10 rounded-md bg-forest px-2 py-1 text-xs font-medium text-cream">Bestseller</span>
        )}
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="transition-transform duration-500 group-hover:scale-105">
            <ProductArt name={p.name} type={p.type} size={92} />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[13px] text-muted">
          {p.type}
          {p.brand ? ` · ${p.brand}` : ""}
        </span>
        <Link href={`/product/${p.slug}`} className="font-display text-[19px] leading-tight text-ink hover:text-sage">
          {p.name}
        </Link>
        {p.ratingCount > 0 && (
          <Link href={`/product/${p.slug}#reviews`} className="flex items-center gap-1.5 text-[13px] text-muted">
            <Stars value={p.ratingAvg} size={14} />
            <span>{p.ratingAvg.toFixed(1)} ({p.ratingCount})</span>
          </Link>
        )}
        {p.shortDesc && <p className="text-sm leading-6 text-muted">{p.shortDesc}</p>}
        {p.variants.length > 1 && (
          <div role="group" aria-label="Pack size" className="flex flex-wrap gap-1.5">
            {p.variants.map((x, i) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={i === sel}
                onClick={() => setSel(i)}
                className={`h-8 rounded-lg border px-3 text-[13px] ${i === sel ? "border-sage bg-mist font-semibold" : "border-line bg-white"}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        )}
        {v && (
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
            <span className="text-xl font-semibold">{inr(v.price)}</span>
            {off > 0 && (
              <>
                <s className="text-sm text-muted">{inr(v.mrp)}</s>
                <span className="text-[13px] font-semibold text-[#2e7d4f]">Save {inr(v.mrp - v.price)}</span>
              </>
            )}
            {p.variants.length === 1 && <span className="text-[13px] text-muted">· {v.label}</span>}
          </div>
        )}
      </div>
      <button
        type="button"
        disabled={out}
        onClick={() => {
          if (!v) return;
          add({ variantId: v.id, slug: p.slug, name: p.name, label: v.label, price: v.price, type: p.type, image: p.image });
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }}
        className={`h-12 text-sm font-medium tracking-wide text-white transition-colors ${out ? "bg-[#8a8f8b]" : added ? "bg-forest" : "bg-sage hover:bg-forest"}`}
      >
        {out ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}
      </button>
    </article>
  );
}
