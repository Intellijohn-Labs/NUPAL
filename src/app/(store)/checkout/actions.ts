"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSettings, shippingFor } from "@/lib/settings";

const schema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
  email: z.string().trim().email("Enter a valid email, or leave it empty.").optional().or(z.literal("")),
  address: z.string().trim().min(8, "Enter your full address."),
  city: z.string().trim().min(2, "Enter your city."),
  state: z.string().trim().min(2, "Enter your state."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({ variantId: z.string(), qty: z.number().int().min(1).max(20) })).min(1, "Your cart is empty."),
});

export type CheckoutInput = z.infer<typeof schema>;
export type CheckoutResult = { ok: true; orderId: string } | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;
  const settings = await getSettings();
  if (!settings.codEnabled) return { ok: false, error: "Cash on delivery is not available right now. Please contact us on WhatsApp." };

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
  if (settings.codMaxOrder != null && subtotal > settings.codMaxOrder)
    return { ok: false, error: `Cash on delivery is available for orders up to ₹${settings.codMaxOrder}.` };
  const shipping = shippingFor(subtotal, settings);
  const codCharge = settings.codCharge;

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
        paymentMethod: "COD",
        items: {
          create: lines.map((l) => ({ variantId: l.v.id, productName: l.v.product.name, variantLabel: l.v.label, price: l.v.price, qty: l.qty })),
        },
      },
    });
  }).catch((e) => (e instanceof Error && e.message === "STOCK" ? null : Promise.reject(e)));

  if (!order) return { ok: false, error: "Some items just went out of stock. Please check your cart." };
  return { ok: true, orderId: order.id };
}
