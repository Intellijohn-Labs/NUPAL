"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inr } from "@/lib/format";
import { placeOrder, type PayuRedirect } from "@/app/(store)/checkout/actions";
import { useCart } from "./CartProvider";

type Props = { shippingFee: number; freeShippingAbove: number | null; codEnabled: boolean; codCharge: number; onlineEnabled: boolean; notice?: string };

/** Sends the browser to PayU’s payment page with the signed fields from the server. */
function goToPayu(p: PayuRedirect) {
  const f = document.createElement("form");
  f.method = "POST";
  f.action = p.action;
  for (const [k, v] of Object.entries(p.fields)) {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = k;
    i.value = v;
    f.appendChild(i);
  }
  document.body.appendChild(f);
  f.submit();
}

const FIELDS = [
  { name: "customerName", label: "Full name", auto: "name", full: true },
  { name: "phone", label: "Mobile number (WhatsApp)", auto: "tel-national", mode: "numeric" as const },
  { name: "email", label: "Email (optional)", auto: "email", type: "email" },
  { name: "address", label: "House name, street and area", auto: "street-address", full: true },
  { name: "city", label: "City", auto: "address-level2" },
  { name: "state", label: "State", auto: "address-level1", def: "Kerala" },
  { name: "pincode", label: "Pincode", auto: "postal-code", mode: "numeric" as const },
];

export function CheckoutForm({ shippingFee, freeShippingAbove, codEnabled, codCharge, onlineEnabled, notice }: Props) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [pay, setPay] = useState<"online" | "cod">(onlineEnabled ? "online" : "cod");
  const [redirecting, setRedirecting] = useState(false);
  const shipping = freeShippingAbove != null && subtotal >= freeShippingAbove ? 0 : shippingFee;
  const cod = pay === "cod" ? codCharge : 0;
  const total = subtotal + shipping + cod;
  const canOrder = pay === "online" ? onlineEnabled : codEnabled;

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
        pay,
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      });
      if (!res.ok) return setError(res.error);
      if (res.payu) {
        // Keep the cart until PayU confirms the payment (cleared on the order page after success).
        setRedirecting(true);
        return goToPayu(res.payu);
      }
      clear();
      router.push(`/order/${res.orderId}`);
    });
  }

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="mb-8 text-[clamp(30px,3.6vw,44px)]">Checkout</h1>
      <form action={submit} className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <fieldset className="grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2">
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
                  required={f.name !== "email" || pay === "online"}
                  className="field"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="notes" className="label">Note for delivery (optional)</label>
              <textarea id="notes" name="notes" rows={2} className="field h-auto py-3" />
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3 rounded-2xl border border-line p-5">
            <legend className="px-1 font-display text-xl">Payment</legend>
            {onlineEnabled && (
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${pay === "online" ? "border-sage bg-mist" : "border-line"}`}>
                <input type="radio" name="pay" value="online" checked={pay === "online"} onChange={() => setPay("online")} className="mt-1 accent-[#567459]" />
                <span>
                  <span className="block font-medium">Pay online</span>
                  <span className="text-sm text-muted">UPI, cards, net banking or wallets, through PayU’s secure page.</span>
                </span>
              </label>
            )}
            {codEnabled && (
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${pay === "cod" ? "border-sage bg-mist" : "border-line"}`}>
                <input type="radio" name="pay" value="cod" checked={pay === "cod"} onChange={() => setPay("cod")} className="mt-1 accent-[#567459]" />
                <span>
                  <span className="block font-medium">Cash on delivery</span>
                  <span className="text-sm text-muted">Pay when your order arrives{codCharge ? ` (₹${codCharge} COD charge)` : ""}.</span>
                </span>
              </label>
            )}
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
          {cod > 0 && <div className="flex justify-between"><span className="text-muted">COD charge</span><span>{inr(cod)}</span></div>}
          <div className="flex items-baseline justify-between"><span className="text-lg font-medium">Total</span><span className="text-2xl font-semibold">{inr(total)}</span></div>
          {notice && !error && <p role="status" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{notice}</p>}
          {error && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
          <button type="submit" disabled={pending || redirecting || !canOrder} className="btn-primary mt-2 h-14 text-base">
            {redirecting ? "Opening secure payment…" : pending ? "Placing order…" : pay === "online" ? `Pay ${inr(total)}` : `Place order · ${inr(total)}`}
          </button>
          {!codEnabled && !onlineEnabled && <p className="text-sm text-[#a3361f]">Ordering is paused right now. Please contact us on WhatsApp.</p>}
        </aside>
      </form>
    </div>
  );
}
