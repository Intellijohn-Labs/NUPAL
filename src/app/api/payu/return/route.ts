import { NextResponse } from "next/server";
import { settlePayu } from "@/lib/payu-orders";

/** PayU sends the customer back here (success and failure) with the payment result as a form post. */
export async function POST(req: Request) {
  const form = await req.formData();
  const fields = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const r = await settlePayu(fields);
  const base = new URL(req.url).origin;
  if (!r) return NextResponse.redirect(`${base}/checkout?payment=error`, 303);
  return NextResponse.redirect(`${base}/order/${r.orderId}?payment=${r.paid ? "success" : "failed"}`, 303);
}
