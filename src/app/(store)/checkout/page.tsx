import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { payuEnabled } from "@/lib/payu";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const s = await getSettings();
  const sp = await searchParams;
  return (
    <CheckoutForm
      shippingFee={s.shippingFee}
      freeShippingAbove={s.freeShippingAbove}
      codEnabled={s.codEnabled}
      codCharge={s.codCharge}
      onlineEnabled={payuEnabled()}
      notice={sp.payment === "error" ? "We couldn’t confirm that payment. If money was taken, contact us on WhatsApp with your phone number." : undefined}
    />
  );
}
