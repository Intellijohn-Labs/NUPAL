import Link from "next/link";
import { notFound } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { PageHeader, Pill } from "@/components/admin/PageHeader";
import { setOrderPayment, setOrderStatus } from "../actions";
import { ORDER_STATUS_TONE as STATUS_TONE } from "@/components/admin/orderStatus";

const FLOW: OrderStatus[] = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireArea("orders");
  const o = await db.order.findUnique({ where: { id: (await params).id }, include: { items: true } });
  if (!o) notFound();
  const nextStatus = FLOW[FLOW.indexOf(o.status) + 1];

  return (
    <>
      <PageHeader title={`Order #${o.number}`} subtitle={o.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}>
        <Link href="/admin/orders" className="a-btn-ghost">All orders</Link>
      </PageHeader>
      <div className="grid items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="a-card">
          <table className="w-full text-sm">
            <thead><tr><th className="a-th">Item</th><th className="a-th">Qty</th><th className="a-th text-right">Amount</th></tr></thead>
            <tbody>
              {o.items.map((i) => (
                <tr key={i.id}><td className="a-td">{i.productName} · {i.variantLabel}<span className="block text-[13px] text-[#56685d]">{inr(i.price)} each</span></td><td className="a-td">{i.qty}</td><td className="a-td text-right">{inr(i.price * i.qty)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-col gap-1 border-t border-[#e8eeea] pt-3 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></p>
            <p className="flex justify-between"><span>Delivery</span><span>{o.shipping ? inr(o.shipping) : "Free"}</span></p>
            {o.codCharge > 0 && <p className="flex justify-between"><span>COD charge</span><span>{inr(o.codCharge)}</span></p>}
            <p className="flex justify-between text-base font-bold"><span>Total</span><span>{inr(o.total)}</span></p>
          </div>
        </section>
        <div className="flex flex-col gap-5">
          <section className="a-card flex flex-col gap-3">
            <div className="flex items-center justify-between"><h2 className="font-sans text-lg font-semibold">Status</h2><Pill tone={STATUS_TONE[o.status]}>{o.status}</Pill></div>
            <div className="flex flex-wrap gap-2">
              {nextStatus && o.status !== "CANCELLED" && (
                <form action={setOrderStatus.bind(null, o.id, nextStatus)}><button className="a-btn">Mark {nextStatus.toLowerCase()}</button></form>
              )}
              {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                <form action={setOrderStatus.bind(null, o.id, "CANCELLED")}><button className="a-btn-danger">Cancel order</button></form>
              )}
              {o.status === "CANCELLED" && <form action={setOrderStatus.bind(null, o.id, "NEW")}><button className="a-btn-ghost">Restore order</button></form>}
            </div>
            <p className="text-sm">Payment: {o.paymentMethod} · <span className="font-semibold">{o.paymentStatus.toLowerCase()}</span></p>
            {o.paymentStatus !== "PAID" && <form action={setOrderPayment.bind(null, o.id, "PAID")}><button className="a-btn-ghost">Mark as paid</button></form>}
          </section>
          <section className="a-card text-sm leading-6">
            <h2 className="mb-2 font-sans text-lg font-semibold">Customer</h2>
            <p className="font-semibold">{o.customerName}</p>
            <p><a className="text-[#2e6b47]" href={`https://wa.me/91${o.phone}`} target="_blank" rel="noopener noreferrer">+91 {o.phone}</a>{o.email ? ` · ${o.email}` : ""}</p>
            <p className="mt-2">{o.address}<br />{o.city}, {o.state} – {o.pincode}</p>
            {o.notes && <p className="mt-2 rounded-lg bg-[#f3f6f4] p-2">Note: {o.notes}</p>}
          </section>
        </div>
      </div>
    </>
  );
}
