"use client";

import { useState } from "react";
import { ProductCard, type CardProduct } from "./ProductCard";

type P = CardProduct & { concernIds: string[] };

export function ConcernFilterGrid({ products, concerns }: { products: P[]; concerns: { id: string; name: string }[] }) {
  const [active, setActive] = useState<string>("all");
  const list = active === "all" ? products : products.filter((p) => p.concernIds.includes(active));
  const chips = [{ id: "all", name: "All" }, ...concerns.filter((c) => products.some((p) => p.concernIds.includes(c.id)))];

  return (
    <>
      <div role="group" aria-label="Select concern" className="mb-8 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={active === c.id}
            onClick={() => setActive(c.id)}
            className={`chip ${active === c.id ? "border-sage bg-mist font-medium" : "border-[#cfdcc9] bg-white hover:border-sage"}`}
          >
            {active === c.id && <span aria-hidden="true">✓</span>}
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      {!list.length && <p className="py-10 text-center text-muted">No products for this concern yet.</p>}
    </>
  );
}
