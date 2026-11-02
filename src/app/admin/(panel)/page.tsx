import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, ROLE_AREAS } from "@/lib/auth";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { dateTimeLabel, istToUtc, todayIST, addDays } from "@/lib/time";
import { PageHeader, Pill } from "@/components/admin/PageHeader";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const areas = ROLE_AREAS[user.role];
  if (!areas.includes("dashboard")) redirect(areas.includes("bookings") ? "/admin/bookings" : "/admin/orders");
  const { denied } = await searchParams;

  const today = todayIST();
  const [newOrders, monthOrders, todayBookings, outOfStock, recentOrders, upcoming, pendingReviews] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.order.aggregate({ _sum: { total: true }, _count: true, where: { status: { not: "CANCELLED" }, createdAt: { gte: istToUtc(today.slice(0, 8) + "01", 0) } } }),
    db.booking.count({ where: { startsAt: { gte: istToUtc(today, 0), lt: istToUtc(addDays(today, 1), 0) }, status: { in: ["CONFIRMED", "PENDING_PAYMENT"] } } }),
    db.variant.findMany({ where: { stock: { lte: 0 }, product: { isActive: true } }, include: { product: true }, take: 8 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.booking.findMany({
      where: { startsAt: { gte: new Date() }, status: { in: ["CONFIRMED", "PENDING_PAYMENT"] } },
      include: { doctor: true, type: true },
      orderBy: { startsAt: "asc" },
      take: 6,
    }),
    db.review.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "New orders to confirm", value: String(newOrders), href: "/admin/orders?status=NEW" },
    { label: "Sales this month", value: inr(monthOrders._sum.total ?? 0), href: "/admin/orders" },
    { label: "Orders this month", value: String(monthOrders._count), href: "/admin/orders" },
    { label: "Consultations today", value: String(todayBookings), href: "/admin/bookings" },
  ];

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} subtitle="Here’s what needs your attention today." />
      {denied && <p className="mb-5 rounded-lg bg-[#f8edd2] px-4 py-3 text-sm text-[#7a5410]">Your account doesn’t have access to that section.</p>}
      {pendingReviews > 0 && areas.includes("reviews") && (
        <Link href="/admin/reviews" className="mb-5 flex items-center justify-between rounded-lg border border-[#e8d9a8] bg-[#f8edd2] px-4 py-3 text-sm font-medium text-[#7a5410]">
          {pendingReviews} customer {pendingReviews === 1 ? "review is" : "reviews are"} waiting for approval <span aria-hidden="true">→</span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="a-card hover:border-[#2e6b47]">
            <p className="text-sm text-[#56685d]">{s.label}</p>
            <p className="mt-1 text-[28px] font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="a-card overflow-x-auto">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-sans text-lg font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[#2e6b47]">All orders</Link>
          </div>
          {recentOrders.length ? (
            <table className="w-full min-w-[520px] text-sm">
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="a-td font-semibold"><Link href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                    <td className="a-td">{o.customerName}</td>
                    <td className="a-td">{inr(o.total)}</td>
                    <td className="a-td"><Pill tone={o.status === "NEW" ? "amber" : o.status === "CANCELLED" ? "red" : "green"}>{o.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-[#56685d]">No orders yet. They’ll appear here as soon as customers check out.</p>
          )}
        </section>
        <div className="flex flex-col gap-5">
          <section className="a-card">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-sans text-lg font-semibold">Upcoming consultations</h2>
              <Link href="/admin/bookings" className="text-sm font-medium text-[#2e6b47]">All</Link>
            </div>
            {upcoming.length ? (
              <ul className="flex flex-col gap-2 text-sm">
                {upcoming.map((b) => (
                  <li key={b.id} className="flex justify-between gap-3 border-t border-[#e8eeea] pt-2">
                    <span><span className="font-semibold">{b.name}</span> · {b.type.name}<br /><span className="text-[#56685d]">{b.doctor.name}</span></span>
                    <span className="text-right text-[#56685d]">{dateTimeLabel(b.startsAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#56685d]">No upcoming bookings.</p>
            )}
          </section>
          <section className="a-card">
            <h2 className="mb-3 font-sans text-lg font-semibold">Out of stock</h2>
            {outOfStock.length ? (
              <ul className="flex flex-col gap-2 text-sm">
                {outOfStock.map((v) => (
                  <li key={v.id} className="flex justify-between gap-3">
                    <Link href={`/admin/products/${v.productId}`} className="font-medium">{v.product.name} · {v.label}</Link>
                    <Pill tone="red">0 left</Pill>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#56685d]">Everything is in stock.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
