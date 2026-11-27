import { settlePayu } from "@/lib/payu-orders";

/**
 * PayU webhook (server to server), so orders are marked paid even if the customer closes the browser before
 * returning. Set it in PayU → Developer → Webhooks → Payments: https://<site>/api/payu/webhook
 */
export async function POST(req: Request) {
  const type = req.headers.get("content-type") ?? "";
  let fields: Record<string, string> = {};
  if (type.includes("json")) fields = Object.fromEntries(Object.entries((await req.json()) as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")]));
  else fields = Object.fromEntries([...(await req.formData()).entries()].map(([k, v]) => [k, String(v)]));
  const r = await settlePayu(fields);
  return Response.json({ ok: Boolean(r) }, { status: r ? 200 : 400 });
}
