"use client";

import Image from "next/image";
import Link from "next/link";
import { inr } from "@/lib/format";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";

export function CartView({ shippingFee, freeShippingAbove }: { shippingFee: number; freeShippingAbove: number | null }) {
  const { items, subtotal, setQty, remove, ready } = useCart();
  const shipping = freeShippingAbove != null && subtotal >= freeShippingAbove ? 0 : shippingFee;

  if (!ready) return <div className="container-x py-16" />;
  if (!items.length)
    return (
      <div className="container-x flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-4xl">Your cart is empty</h1>
        <p className="text-muted">Browse medicines by health concern, or ask our doctor what suits you.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">Browse products</Link>
          <Link href="/consult" className="btn-outline">Consult an expert</Link>
        </div>
      </div>
    );

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="mb-8 text-[clamp(30px,3.6vw,44px)]">Your cart</h1>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="flex flex-col gap-3">
          {items.map((i) => (
            <li key={i.variantId} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4">
              <Link href={`/product/${i.slug}`} className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {i.image ? <Image src={i.image} alt="" fill sizes="96px" className="bg-white object-contain p-1.5" /> : <ProductArt name={i.name} type={i.type} size={56} />}
              </Link>
              <div className="min-w-[140px] flex-1">
                <Link href={`/product/${i.slug}`} className="font-display text-lg hover:text-sage">{i.name}</Link>
                <p className="text-sm text-muted">{i.label}</p>
                <p className="mt-1 font-semibold">{inr(i.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 items-center rounded-full border border-line">
                  <button type="button" aria-label={`Decrease ${i.name}`} className="h-11 w-11 text-lg" onClick={() => setQty(i.variantId, i.qty - 1)}>−</button>
                  <span className="w-6 text-center font-semibold">{i.qty}</span>
                  <button type="button" aria-label={`Increase ${i.name}`} className="h-11 w-11 text-lg" onClick={() => setQty(i.variantId, i.qty + 1)}>+</button>
                </div>
                <button type="button" onClick={() => remove(i.variantId)} className="h-11 rounded-full px-3 text-sm text-[#a3361f] hover:bg-[#fbe6e0]">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <aside className="flex flex-col gap-3 rounded-2xl bg-cream p-6">
          <h2 className="text-xl">Order summary</h2>
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{inr(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
          {freeShippingAbove != null && shipping > 0 && (
            <p className="text-sm text-sage-dark">Add {inr(freeShippingAbove - subtotal)} more for free delivery.</p>
          )}
          <div className="my-1 h-px bg-line" />
          <div className="flex items-baseline justify-between"><span className="text-lg font-medium">Total</span><span className="text-2xl font-semibold">{inr(subtotal + shipping)}</span></div>
          <Link href="/checkout" className="btn-primary mt-2 h-14 text-base">Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}
