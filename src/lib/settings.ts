import { cache } from "react";
import { db } from "./db";

export const getSettings = cache(async () => {
  const s = await db.setting.findUnique({ where: { id: "site" } });
  return s ?? (await db.setting.create({ data: { id: "site" } }));
});

export function shippingFor(subtotal: number, s: { shippingFee: number; freeShippingAbove: number | null }) {
  if (s.freeShippingAbove != null && subtotal >= s.freeShippingAbove) return 0;
  return s.shippingFee;
}
