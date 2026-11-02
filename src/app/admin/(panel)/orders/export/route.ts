import type { OrderStatus } from "@prisma/client";
import { currentUser, can } from "@/lib/auth";
import { db } from "@/lib/db";

const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// CSV opens directly in Excel.
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !can(user.role, "orders")) return new Response("Not allowed", { status: 403 });
  const status = new URL(req.url).searchParams.get("status") as OrderStatus | null;
  const orders = await db.order.findMany({ where: status ? { status } : {}, include: { items: true }, orderBy: { createdAt: "desc" } });
  const head = ["Order", "Date", "Customer", "Phone", "Email", "Address", "City", "State", "Pincode", "Items", "Subtotal", "Delivery", "COD charge", "Total", "Payment", "Payment status", "Status"];
  const rows = orders.map((o) => [
    o.number,
    o.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    o.customerName, o.phone, o.email, o.address, o.city, o.state, o.pincode,
    o.items.map((i) => `${i.productName} (${i.variantLabel}) x${i.qty}`).join("; "),
    o.subtotal, o.shipping, o.codCharge, o.total, o.paymentMethod, o.paymentStatus, o.status,
  ]);
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="nupal-orders-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
