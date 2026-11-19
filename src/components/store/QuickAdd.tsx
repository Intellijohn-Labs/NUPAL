"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

/** Small "Add" button for one pack of a product (used in "Frequently bought together"). */
export function QuickAdd({ item }: { item: { variantId: string; slug: string; name: string; label: string; price: number; type: string; image: string | null } }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        add(item, 1);
        setDone(true);
      }}
      className={`h-10 shrink-0 rounded-lg px-4 text-[13px] font-semibold uppercase tracking-[.04em] transition-colors ${done ? "bg-[#EAF2E7] text-[#174D36]" : "bg-[#174D36] text-white hover:bg-[#397C42]"}`}
    >
      {done ? "Added ✓" : "Add"}
    </button>
  );
}
