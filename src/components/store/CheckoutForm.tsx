"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inr } from "@/lib/format";
import { placeOrder } from "@/app/(store)/checkout/actions";
import { useCart } from "./CartProvider";

type Props = { shippingFee: number; freeShippingAbove: number | null; codEnabled: boolean; codCharge: number };

const FIELDS = [
  { name: "customerName", label: "Full name", auto: "name", full: true },
  { name: "phone", label: "Mobile number (WhatsApp)", auto: "tel-national", mode: "numeric" as const },
  { name: "email", label: "Email (optional)", auto: "email", type: "email" },
  { name: "address", label: "House name, street and area", auto: "street-address", full: true },
  { name: "city", label: "City", auto: "address-level2" },
  { name: "state", label: "State", auto: "address-level1", def: "Kerala" },
  { name: "pincode", label: "Pincode", auto: "postal-code", mode: "numeric" as const },
];

export function CheckoutForm({ shippingFee, freeShippingAbove, codEnabled, codCharge }: Props) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const shipping = freeShippingAbove != null && subtotal >= freeShippingAbove ? 0 : shippingFee;
  const total = subtotal + shipping + (codEnabled ? codCharge : 0);

  if (ready && !items.length)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-6">Browse products</Link>
      </div>
    );

  function submit(form: FormData) {
    setError("");
    const get = (k: string) => String(form.get(k) ?? "");
    start(async () => {
      const res = await placeOrder({
        customerName: get("customerName"),
        phone: get("phone").replace(/\D/g, "").slice(-10),
        email: get("email"),
        address: get("address"),
        city: get("city"),
        state: get("state"),
        pincode: get("pincode"),
        notes: get("notes"),
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      });
      if (!res.ok) return setError(res.error);
      clear();
      router.push(`/order/${res.orderId}`);
    });
  }

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="mb-8 text-[clamp(30px,3.6vw,44px)]">Checkout</h1>
      <form action={submit} className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <fieldset className="grid grid-cols-1 gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2">
            <legend className="px-1 font-display text-xl">Delivery details</legend>
            {FIELDS.map((f) => (
              <div key={f.name} className={`flex flex-col gap-1.5 ${f.full ? "sm:col-span-2" : ""}`}>
                <label htmlFor={f.name} className="label">{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type ?? "text"}
                  inputMode={f.mode}
                  autoComplete={f.auto}
                  defaultValue={f.def}
                  required={f.name !== "email"}
                  className="field"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="notes" className="label">Note for delivery (optional)</label>
              <textarea id="notes" name="notes" rows={2} className="field h-auto py-3" />
            </div>
          </fieldset>
          <fieldset className="rounded-2xl border border-line p-5">
            <legend className="px-1 font-display text-xl">Payment</legend>
            <label className="flex items-start gap-3 rounded-xl border border-sage bg-mist p-4">
              <input type="radio" name="pay" defaultChecked className="mt-1 accent-[#567459]" />
              <span>
                <span className="block font-medium">Cash on delivery</span>
                <span className="text-sm text-muted">
                  Pay when your order arrives{codCharge ? ` (₹${codCharge} COD charge)` : ""}. Online payment (UPI, cards) is coming soon.
                </span>
              </span>
            </label>
          </fieldset>
        </div>
        <aside className="flex flex-col gap-3 rounded-2xl bg-cream p-6">
          <h2 className="text-xl">Your order</h2>
          <ul className="flex flex-col gap-2 text-[15px]">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-3">
                <span>{i.name} <span className="text-muted">· {i.label} × {i.qty}</span></span>
                <span>{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="my-1 h-px bg-line" />
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{inr(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
          {codCharge > 0 && <div className="flex justify-between"><span className="text-muted">COD charge</span><span>{inr(codCharge)}</span></div>}
          <div className="flex items-baseline justify-between"><span className="text-lg font-medium">Total</span><span className="text-2xl font-semibold">{inr(total)}</span></div>
          {error && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
          <button type="submit" disabled={pending || !codEnabled} className="btn-primary mt-2 h-14 text-base">
            {pending ? "Placing order…" : `Place order · ${inr(total)}`}
          </button>
          {!codEnabled && <p className="text-sm text-[#a3361f]">Ordering is paused right now. Please contact us on WhatsApp.</p>}
        </aside>
      </form>
    </div>
  );
}
