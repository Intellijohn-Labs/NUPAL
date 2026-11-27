import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { ClearCart } from "@/components/store/ClearCart";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await db.order.findUnique({ where: { id: (await params).id }, include: { items: true } });
  if (!order) notFound();
  const online = order.paymentMethod === "ONLINE";
  const paid = order.paymentStatus === "PAID";
  const failed = online && order.paymentStatus === "FAILED";
  const waiting = online && !paid && !failed;
  const first = order.customerName.split(" ")[0];

  return (
    <div className="container-x flex max-w-[640px] flex-col items-center gap-5 py-16 text-center">
      {/* the cart is kept until an online payment is confirmed */}
      {(!online || paid) && <ClearCart />}
      <span className={`flex h-20 w-20 items-center justify-center rounded-full ${failed ? "bg-[#a3361f]" : waiting ? "bg-[#C9A45C]" : "bg-sage"}`}>
        {failed ? (
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : waiting ? (
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" /></svg>
        ) : (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        )}
      </span>

      {failed ? (
        <>
          <h1 className="text-4xl">Payment didn’t go through</h1>
          <p className="text-lg text-muted">No money was taken for order #{order.number}. Your cart is still saved, so you can try again or choose cash on delivery.</p>
          <Link href="/checkout" className="btn-primary">Try again</Link>
        </>
      ) : waiting ? (
        <>
          <h1 className="text-4xl">Confirming your payment…</h1>
          <p className="text-lg text-muted">
            We’re waiting for PayU to confirm the payment for order <span className="font-semibold text-ink">#{order.number}</span>. This page updates once it’s confirmed. If money was taken, you don’t need to pay again.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl">Thank you, {first}!</h1>
          <p className="text-lg text-muted">
            Order <span className="font-semibold text-ink">#{order.number}</span> is placed{online ? " and paid" : ""}. We’ll call or WhatsApp you on {order.phone} to confirm delivery.
          </p>
        </>
      )}

      <div className="w-full rounded-2xl bg-cream p-5 text-left">
        <ul className="flex flex-col gap-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3"><span>{i.productName} · {i.variantLabel} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></li>
          ))}
        </ul>
        <div className="my-3 h-px bg-line" />
        <div className="flex justify-between font-semibold">
          <span>Total ({online ? (paid ? "paid online" : failed ? "not paid" : "online payment") : "cash on delivery"})</span>
          <span>{inr(order.total)}</span>
        </div>
        <p className="mt-3 text-sm text-muted">Delivering to {order.address}, {order.city}, {order.state} – {order.pincode}</p>
      </div>
      {!failed && <Link href="/shop" className="btn-primary">Continue shopping</Link>}
      {waiting && <meta httpEquiv="refresh" content="8" />}
    </div>
  );
}
