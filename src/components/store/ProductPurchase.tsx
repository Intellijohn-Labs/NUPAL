"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { inr, pctOff } from "@/lib/format";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";

type V = { id: string; label: string; mrp: number; price: number; stock: number };
type Concern = { name: string; slug: string };

/**
 * Product page buy box (Dr Vaidya's-style): price with MRP and % off, pack-size cards, other concerns,
 * quantity and Add to cart. Once the main button scrolls out of view, a slim bar with the same choice
 * sticks to the bottom of the screen (above the phone menu).
 */
export function ProductPurchase({
  product,
  variants,
  otherConcerns,
}: {
  product: { slug: string; name: string; type: string; image: string | null };
  variants: V[];
  otherConcerns: Concern[];
}) {
  const { add } = useCart();
  const [sel, setSel] = useState(() => Math.max(0, variants.findIndex((v) => v.stock > 0)));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    // Show the bar only after the visitor has scrolled past the main button (not while it is still below the fold).
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const v = variants[sel];
  if (!v) return <p className="text-muted">This product is not available right now.</p>;
  const off = pctOff(v.mrp, v.price);
  const out = v.stock <= 0;

  const addToCart = () => {
    add({ variantId: v.id, slug: product.slug, name: product.name, label: v.label, price: v.price, type: product.type, image: product.image }, qty);
    setAdded(true);
  };

  const Stepper = ({ small = false }: { small?: boolean }) => (
    <div className={`flex items-center rounded-lg border border-[#D9E3D5] bg-white ${small ? "h-11" : "h-[52px]"}`}>
      <button type="button" aria-label="Decrease quantity" className={`${small ? "w-9" : "w-11"} h-full text-xl text-[#5e6862] disabled:opacity-40`} disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
      <span aria-live="polite" aria-label={`Quantity ${qty}`} className="w-7 text-center font-semibold text-[#174D36]">{qty}</span>
      <button type="button" aria-label="Increase quantity" className={`${small ? "w-9" : "w-11"} h-full text-xl text-[#5e6862] disabled:opacity-40`} disabled={qty >= 20} onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* price */}
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[28px] font-semibold leading-none text-[#174D36]">{inr(v.price)}</span>
          {off > 0 && (
            <>
              <s className="text-lg text-[#8a928c]">{inr(v.mrp)}</s>
              <span className="rounded-full bg-[#174D36] px-2.5 py-1 text-[12px] font-semibold leading-none text-white">{off}% OFF</span>
            </>
          )}
        </div>
        <p className="mt-1.5 text-[13px] italic text-[#6b746e]">(Inclusive of all taxes | Proudly made in Kerala)</p>
      </div>

      {/* pack sizes */}
      <div>
        <p className="text-[15px] font-semibold text-[#22302A]">
          Size: <span className="font-normal">{v.label}</span>
        </p>
        {variants.length > 1 && (
          <div role="radiogroup" aria-label="Pack size" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {variants.map((x, i) => {
              const on = i === sel;
              const xOff = pctOff(x.mrp, x.price);
              return (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSel(i)}
                  className={`relative flex flex-col items-center rounded-xl border-2 p-2 pb-3 text-center transition-colors ${on ? "border-[#174D36] bg-[#174D36] text-white" : "border-[#E3E8E0] bg-white text-[#22302A] hover:border-[#9DBA94]"}`}
                >
                  {i === 0 && variants.length > 1 && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#397C42] px-2 py-0.5 text-[10.5px] font-semibold text-white">Trial pack</span>
                  )}
                  <span className="relative mb-2 block aspect-square w-full overflow-hidden rounded-lg bg-[#F1F5EE]">
                    {product.image ? (
                      <Image src={product.image} alt="" fill sizes="140px" className="object-contain p-1.5" />
                    ) : (
                      <span className="flex h-full items-center justify-center [&>svg]:h-auto [&>svg]:w-2/3"><ProductArt name={product.name} type={product.type} size={80} /></span>
                    )}
                  </span>
                  <span className="text-[14px] font-semibold uppercase leading-tight">{x.label}</span>
                  {xOff > 0 && <span className="mt-1.5 rounded-full bg-[#3E9A4F] px-2 py-0.5 text-[11px] font-semibold text-white">{xOff}% OFF</span>}
                  <span className="mt-1 text-[14px] font-semibold">
                    {inr(x.price)} {xOff > 0 && <s className={`ml-0.5 text-[12px] font-normal ${on ? "text-white/70" : "text-[#8a928c]"}`}>{inr(x.mrp)}</s>}
                  </span>
                  {x.stock <= 0 && <span className={`mt-1 text-[11.5px] ${on ? "text-white/80" : "text-[#a3361f]"}`}>Out of stock</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* other concerns */}
      {otherConcerns.length > 0 && (
        <div>
          <p className="text-[15px] font-semibold text-[#22302A]">Any other concerns? <span className="font-normal text-[#6b746e]">(Complete your health goals)</span></p>
          <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {otherConcerns.map((c) => (
              <Link key={c.slug} href={`/concern/${c.slug}`} className="inline-flex h-10 shrink-0 items-center rounded-lg border border-[#D9E3D5] bg-[#F4F8F1] px-3.5 text-[14px] text-[#174D36] transition-colors hover:border-[#397C42] hover:bg-white">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* quantity + add to cart */}
      <div ref={buyRef}>
        <p className="mb-2 text-[15px] font-semibold text-[#22302A]">Quantity</p>
        {out ? (
          <p className="rounded-xl bg-[#fbe6e0] px-4 py-3 text-[#a3361f]">Out of stock. Message us on WhatsApp to be told when it’s back.</p>
        ) : (
          <div className="flex gap-3">
            <Stepper />
            <button type="button" onClick={addToCart} className="h-[52px] flex-1 rounded-lg bg-[#174D36] text-[15px] font-semibold uppercase tracking-[.04em] text-white transition-colors hover:bg-[#397C42]">
              Add to cart
            </button>
          </div>
        )}
        {added && (
          <p role="status" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#EAF2E7] px-4 py-3 text-[15px] text-[#174D36]">
            Added to your cart.
            <Link href="/cart" className="font-semibold underline">View cart</Link>
          </p>
        )}
      </div>

      {/* sticky bar after the main button scrolls away */}
      {!out && (
        <div
          aria-hidden={!showBar}
          className={`fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-40 border-t border-[#E3E8E0] bg-white/95 shadow-[0_-10px_28px_-18px_rgba(0,0,0,.4)] backdrop-blur transition-transform duration-300 lg:bottom-0 ${showBar ? "translate-y-0" : "pointer-events-none translate-y-[160%]"}`}
        >
          {/* desktop: room on the right for the floating WhatsApp button */}
          <div className="container-x flex items-center gap-3 py-2.5 lg:pr-28">
            <span className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F1F5EE] sm:block">
              {product.image && <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />}
            </span>
            <span className="hidden min-w-0 flex-1 truncate text-[15px] font-medium text-[#22302A] md:block">{product.name}</span>
            {variants.length > 1 ? (
              <select
                aria-label="Pack size"
                tabIndex={showBar ? 0 : -1}
                value={sel}
                onChange={(e) => setSel(Number(e.target.value))}
                className="h-11 min-w-0 flex-1 rounded-lg border border-[#D9E3D5] bg-white px-2 text-[14px] md:w-56 md:flex-none"
              >
                {variants.map((x, i) => (
                  <option key={x.id} value={i}>
                    {x.label} - {inr(x.price)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="min-w-0 flex-1 text-[14px] text-[#22302A] md:flex-none">
                <span className="block truncate font-medium md:hidden">{product.name}</span>
                <span className="font-semibold text-[#174D36]">{inr(v.price)}</span>
                {off > 0 && <s className="ml-1.5 text-[12.5px] text-[#8a928c]">{inr(v.mrp)}</s>}
              </span>
            )}
            <span className="hidden sm:block"><Stepper small /></span>
            <button type="button" tabIndex={showBar ? 0 : -1} onClick={addToCart} className="h-11 shrink-0 rounded-lg bg-[#174D36] px-5 text-[14px] font-semibold uppercase tracking-[.04em] text-white hover:bg-[#397C42] sm:px-7">
              Add to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
