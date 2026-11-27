"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { getSettings, shippingFor } from "@/lib/settings";
import { payuEnabled, payuForm } from "@/lib/payu";

const schema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
  email: z.string().trim().email("Enter a valid email, or leave it empty.").optional().or(z.literal("")),
  address: z.string().trim().min(8, "Enter your full address."),
  city: z.string().trim().min(2, "Enter your city."),
  state: z.string().trim().min(2, "Enter your state."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
  notes: z.string().trim().max(500).optional(),
  pay: z.enum(["cod", "online"]).default("cod"),
  items: z.array(z.object({ variantId: z.string(), qty: z.number().int().min(1).max(20) })).min(1, "Your cart is empty."),
});

export type CheckoutInput = z.infer<typeof schema>;
export type PayuRedirect = { action: string; fields: Record<string, string> };
export type CheckoutResult = { ok: true; orderId: string; payu?: PayuRedirect } | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;
  const settings = await getSettings();
  const online = data.pay === "online";
  if (online && !payuEnabled()) return { ok: false, error: "Online payment is not available right now. Please choose cash on delivery." };
  if (online && !data.email) return { ok: false, error: "Enter your email for online payment (PayU sends the receipt there)." };
  if (!online && !settings.codEnabled) return { ok: false, error: "Cash on delivery is not available right now. Please pay online or contact us on WhatsApp." };

  const variants = await db.variant.findMany({
    where: { id: { in: data.items.map((i) => i.variantId) } },
    include: { product: true },
  });

  const lines: { v: (typeof variants)[number]; qty: number }[] = [];
  for (const item of data.items) {
    const v = variants.find((x) => x.id === item.variantId);
    if (!v || !v.product.isActive) return { ok: false, error: "A product in your cart is no longer available. Please remove it and try again." };
    if (v.stock < item.qty) return { ok: false, error: `Only ${v.stock} left of ${v.product.name} (${v.label}). Please lower the quantity.` };
    lines.push({ v, qty: item.qty });
  }

  const subtotal = lines.reduce((s, l) => s + l.v.price * l.qty, 0);
  if (!online && settings.codMaxOrder != null && subtotal > settings.codMaxOrder)
    return { ok: false, error: `Cash on delivery is available for orders up to ₹${settings.codMaxOrder}.` };
  const shipping = shippingFor(subtotal, settings);
  const codCharge = online ? 0 : settings.codCharge;
  const payuTxnId = online ? `NP${Date.now().toString(36)}${randomBytes(4).toString("hex")}`.toUpperCase() : null;

  const order = await db.$transaction(async (tx) => {
    for (const l of lines) {
      const updated = await tx.variant.updateMany({ where: { id: l.v.id, stock: { gte: l.qty } }, data: { stock: { decrement: l.qty } } });
      if (updated.count === 0) throw new Error("STOCK");
    }
    return tx.order.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        notes: data.notes || null,
        subtotal,
        shipping,
        codCharge,
        total: subtotal + shipping + codCharge,
        paymentMethod: online ? "ONLINE" : "COD",
        payuTxnId,
        items: {
          create: lines.map((l) => ({ variantId: l.v.id, productName: l.v.product.name, variantLabel: l.v.label, price: l.v.price, qty: l.qty })),
        },
      },
    });
  }).catch((e) => (e instanceof Error && e.message === "STOCK" ? null : Promise.reject(e)));

  if (!order) return { ok: false, error: "Some items just went out of stock. Please check your cart." };
  if (!online) return { ok: true, orderId: order.id };

  // Online: send the customer to PayU. PayU posts the result back to /api/payu/return on this same site.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const payu = payuForm({
    txnid: payuTxnId!,
    amount: order.total,
    productinfo: `NUPAL order #${order.number}`,
    firstname: data.customerName.split(/\s+/)[0].slice(0, 60),
    email: data.email!,
    phone: data.phone,
    orderId: order.id,
    baseUrl: `${proto}://${host}`,
  });
  return { ok: true, orderId: order.id, payu };
}
