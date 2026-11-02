import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CartView } from "@/components/store/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const s = await getSettings();
  return <CartView shippingFee={s.shippingFee} freeShippingAbove={s.freeShippingAbove} />;
}
