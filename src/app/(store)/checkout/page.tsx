import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const s = await getSettings();
  return (
    <CheckoutForm
      shippingFee={s.shippingFee}
      freeShippingAbove={s.freeShippingAbove}
      codEnabled={s.codEnabled}
      codCharge={s.codCharge}
    />
  );
}
