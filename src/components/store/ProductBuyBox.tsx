"use client";

import Link from "next/link";
import { useState } from "react";
import { inr, pctOff } from "@/lib/format";
import { useCart } from "./CartProvider";

type V = { id: string; label: string; mrp: number; price: number; stock: number };

export function ProductBuyBox({ product, variants }: { product: { slug: string; name: string; type: string; image: string | null }; variants: V[] }) {
  const { add } = useCart();
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const v = variants[sel];
  if (!v) return <p className="text-muted">This product is not available right now.</p>;
  const off = pctOff(v.mrp, v.price);
  const out = v.stock <= 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line p-5">
      {variants.length > 1 && (
        <div>
          <p className="label mb-2">Pack size</p>
          <div role="radiogroup" aria-label="Pack size" className="flex flex-wrap gap-2">
            {variants.map((x, i) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={i === sel}
                onClick={() => setSel(i)}
                className={`rounded-xl border px-4 py-2 text-left ${i === sel ? "border-sage bg-mist" : "border-line"}`}
              >
                <span className="block font-medium">{x.label}</span>
                <span className="text-sm text-muted">{inr(x.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-semibold">{inr(v.price)}</span>
        {off > 0 && (
          <>
            <s className="text-muted">MRP {inr(v.mrp)}</s>
            <span className="rounded-md bg-pestle px-2 py-0.5 text-sm font-semibold text-white">{off}% off</span>
          </>
        )}
        <span className="w-full text-sm text-muted">{variants.length === 1 ? `${v.label} · ` : ""}Inclusive of all taxes</span>
      </div>
      {out ? (
        <p className="rounded-xl bg-[#fbe6e0] px-4 py-3 text-[#a3361f]">Out of stock. Message us on WhatsApp to be told when it’s back.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <div className="flex h-12 items-center rounded-full border border-line">
            <button type="button" aria-label="Decrease quantity" className="h-12 w-12 text-xl" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span aria-live="polite" className="w-8 text-center font-semibold">{qty}</span>
            <button type="button" aria-label="Increase quantity" className="h-12 w-12 text-xl" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
          </div>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              add({ variantId: v.id, slug: product.slug, name: product.name, label: v.label, price: v.price, type: product.type, image: product.image }, qty);
              setAdded(true);
            }}
          >
            Add to cart · {inr(v.price * qty)}
          </button>
        </div>
      )}
      {added && (
        <p role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mist px-4 py-3 text-[15px]">
          Added to your cart.
          <Link href="/cart" className="font-medium text-sage underline">View cart</Link>
        </p>
      )}
    </div>
  );
}
