import { getOpenDates } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const doctor = new URL(req.url).searchParams.get("doctor") || "any";
  return Response.json(await getOpenDates(doctor, 14));
}
