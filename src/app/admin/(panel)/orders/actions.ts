"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireArea("orders");
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;
  await db.$transaction(async (tx) => {
    // Return stock when an order is cancelled (and take it again if un-cancelled).
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const i of order.items) if (i.variantId) await tx.variant.update({ where: { id: i.variantId }, data: { stock: { increment: i.qty } } });
    }
    if (order.status === "CANCELLED" && status !== "CANCELLED") {
      for (const i of order.items) if (i.variantId) await tx.variant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.qty } } });
    }
    await tx.order.update({ where: { id }, data: { status, ...(status === "DELIVERED" && order.paymentMethod === "COD" ? { paymentStatus: "PAID" } : {}) } });
  });
  await notify({ kind: "order.status", number: order.number, phone: order.phone, email: order.email, text: `Order status: ${status}` });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function setOrderPayment(id: string, paymentStatus: PaymentStatus) {
  await requireArea("orders");
  await db.order.update({ where: { id }, data: { paymentStatus } });
  revalidatePath(`/admin/orders/${id}`);
}
