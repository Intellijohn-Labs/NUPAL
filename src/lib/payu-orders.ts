import "server-only";
import { db } from "@/lib/db";
import { payuResponseValid, payuVerify } from "@/lib/payu";

/**
 * Applies a PayU payment result to its order. Used by the return page and the webhook, so it is safe to run twice.
 * The order is only marked paid when PayU's own verify API says the payment succeeded for the full amount.
 * A failed payment cancels the order and puts its stock back (the customer's cart is still there to try again).
 */
export async function settlePayu(fields: Record<string, string>): Promise<{ orderId: string; paid: boolean } | null> {
  if (!payuResponseValid(fields)) return null;
  const order = await db.order.findUnique({ where: { payuTxnId: fields.txnid }, include: { items: true } });
  if (!order) return null;
  if (order.paymentStatus === "PAID") return { orderId: order.id, paid: true };

  const v = await payuVerify(fields.txnid);
  const success = v?.status === "success" && Math.round(v.amount) === order.total;

  if (success) {
    await db.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID", status: order.status === "CANCELLED" ? "NEW" : order.status, paymentRef: v?.mihpayid ?? fields.mihpayid ?? null, paymentMode: v?.mode ?? fields.mode ?? null },
    });
    return { orderId: order.id, paid: true };
  }

  // Not paid. Only close it when PayU says it failed (a "pending" bank payment may still go through).
  const failed = v ? v.status === "failure" || v.status === "failed" || v.status === "cancel" : fields.status === "failure";
  if (failed && order.paymentStatus === "PENDING") {
    await db.$transaction(async (tx) => {
      const n = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
      if (n.count === 0) return; // already handled
      for (const i of order.items) if (i.variantId) await tx.variant.update({ where: { id: i.variantId }, data: { stock: { increment: i.qty } } });
    });
  }
  return { orderId: order.id, paid: false };
}
