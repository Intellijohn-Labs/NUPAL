import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { PageHeader, Pill } from "@/components/admin/PageHeader";

import { ORDER_STATUS_TONE as STATUS_TONE } from "@/components/admin/orderStatus";
const STATUSES: OrderStatus[] = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireArea("orders");
  const { status, q } = await searchParams;
  const s = STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await db.order.findMany({
    where: {
      ...(s ? { status: s } : {}),
      ...(q ? { OR: [{ customerName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : {}),
    },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <>
      <PageHeader title="Orders">
        <a href={`/admin/orders/export${s ? `?status=${s}` : ""}`} className="a-btn-ghost">Export to Excel</a>
      </PageHeader>
      <div className="a-card">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#f3f6f4] p-1">
            <Link href="/admin/orders" className={`rounded-lg px-3 py-2 text-sm font-semibold ${!s ? "bg-white" : "text-[#56685d]"}`}>All</Link>
            {STATUSES.map((x) => (
              <Link key={x} href={`/admin/orders?status=${x}`} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${s === x ? "bg-white" : "text-[#56685d]"}`}>
                {x.toLowerCase()}
              </Link>
            ))}
          </div>
          <form className="flex flex-1 gap-2">
            {s && <input type="hidden" name="status" value={s} />}
            <label htmlFor="oq" className="sr-only">Search orders</label>
            <input id="oq" name="q" defaultValue={q} placeholder="Name or phone" className="a-input max-w-xs" />
            <button className="a-btn-ghost">Search</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr><th className="a-th">Order</th><th className="a-th">Customer</th><th className="a-th">Items</th><th className="a-th">Date</th><th className="a-th">Total</th><th className="a-th">Payment</th><th className="a-th">Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="a-td font-semibold"><Link href={`/admin/orders/${o.id}`} className="text-[#2e6b47]">#{o.number}</Link></td>
                  <td className="a-td">{o.customerName}<span className="block text-[13px] text-[#56685d]">{o.phone} · {o.city}</span></td>
                  <td className="a-td">{o._count.items}</td>
                  <td className="a-td text-[#56685d]">{o.createdAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                  <td className="a-td font-semibold">{inr(o.total)}</td>
                  <td className="a-td">{o.paymentMethod} · {o.paymentStatus.toLowerCase()}</td>
                  <td className="a-td"><Pill tone={STATUS_TONE[o.status]}>{o.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <p className="py-8 text-center text-[#56685d]">No orders yet.</p>}
        </div>
      </div>
    </>
  );
}
