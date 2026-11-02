import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await db.order.findUnique({ where: { id: (await params).id }, include: { items: true } });
  if (!order) notFound();
  return (
    <div className="container-x flex max-w-[640px] flex-col items-center gap-5 py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sage">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <h1 className="text-4xl">Thank you, {order.customerName.split(" ")[0]}!</h1>
      <p className="text-lg text-muted">
        Order <span className="font-semibold text-ink">#{order.number}</span> is placed. We’ll call or WhatsApp you on {order.phone} to confirm delivery.
      </p>
      <div className="w-full rounded-2xl bg-cream p-5 text-left">
        <ul className="flex flex-col gap-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3"><span>{i.productName} · {i.variantLabel} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></li>
          ))}
        </ul>
        <div className="my-3 h-px bg-line" />
        <div className="flex justify-between font-semibold"><span>Total (cash on delivery)</span><span>{inr(order.total)}</span></div>
        <p className="mt-3 text-sm text-muted">Delivering to {order.address}, {order.city}, {order.state} – {order.pincode}</p>
      </div>
      <Link href="/shop" className="btn-primary">Continue shopping</Link>
    </div>
  );
}
