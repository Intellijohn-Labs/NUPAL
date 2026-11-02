"use client";

import { useRouter } from "next/navigation";

/** Product dropdown that updates the URL as soon as a product is picked. */
export function ProductFilterSelect({ products, value, baseQuery }: { products: { slug: string; name: string }[]; value: string; baseQuery: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="rv-product" className="label">Product</label>
      <select
        id="rv-product"
        value={value}
        onChange={(e) => {
          const q = new URLSearchParams(baseQuery);
          if (e.target.value) q.set("product", e.target.value);
          else q.delete("product");
          q.delete("show");
          router.push(`/reviews${q.toString() ? `?${q}` : ""}`, { scroll: false });
        }}
        className="field"
      >
        <option value="">All products</option>
        {products.map((p) => (
          <option key={p.slug} value={p.slug}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}
