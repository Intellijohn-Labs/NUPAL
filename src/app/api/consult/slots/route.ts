import { getSlots } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const date = sp.get("date") ?? "";
  const type = sp.get("type") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !type) return Response.json([], { status: 400 });
  const slots = await getSlots(date, type, sp.get("doctor") || "any");
  return Response.json(slots.map((s) => s.min));
}
