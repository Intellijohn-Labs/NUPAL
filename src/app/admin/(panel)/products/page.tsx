import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { Flash, PageHeader, Pill } from "@/components/admin/PageHeader";
import { toggleProduct } from "./actions";

type SP = Promise<{ q?: string; status?: string; deleted?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  await requireArea("products");
  const { q, status, deleted } = await searchParams;
  const where: Prisma.ProductWhereInput = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "hidden" ? { isActive: false } : status === "out" ? { variants: { some: { stock: { lte: 0 } } } } : status === "visible" ? { isActive: true } : {}),
  };
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { variants: { orderBy: { sortOrder: "asc" } }, concerns: { include: { concern: true } } },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    db.product.count(),
  ]);
  const tabs = [
    ["", "All"],
    ["visible", "Visible"],
    ["hidden", "Hidden"],
    ["out", "Out of stock"],
  ];

  return (
    <>
      <PageHeader title="Products" subtitle={`${total} products in the catalogue`}>
        <Link href="/admin/products/new" className="a-btn">+ Add product</Link>
      </PageHeader>
      <Flash show={!!deleted}>Product removed.</Flash>
      <div className="a-card">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#f3f6f4] p-1">
            {tabs.map(([k, l]) => (
              <Link key={k} href={`/admin/products${k ? `?status=${k}` : ""}`} className={`rounded-lg px-3 py-2 text-sm font-semibold ${status === k || (!status && !k) ? "bg-white" : "text-[#56685d]"}`}>
                {l}
              </Link>
            ))}
          </div>
          <form className="flex flex-1 gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            <label htmlFor="pq" className="sr-only">Search products</label>
            <input id="pq" name="q" defaultValue={q} placeholder="Search by name" className="a-input max-w-xs" />
            <button className="a-btn-ghost">Search</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr>
                <th className="a-th">Product</th>
                <th className="a-th">Concerns</th>
                <th className="a-th">Price</th>
                <th className="a-th">Stock</th>
                <th className="a-th">On website</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                const prices = p.variants.map((v) => v.price);
                return (
                  <tr key={p.id}>
                    <td className="a-td">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6efe9] text-xs text-[#56685d]">No photo</span>
                        )}
                        <span>
                          <span className="block font-semibold">{p.name}</span>
                          <span className="text-[13px] text-[#56685d]">{p.type}{p.brand ? ` · ${p.brand}` : ""}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="a-td text-[#56685d]">{p.concerns.map((c) => c.concern.name).join(", ") || "—"}</td>
                    <td className="a-td font-semibold">{prices.length ? (Math.min(...prices) === Math.max(...prices) ? inr(prices[0]) : `${inr(Math.min(...prices))}–${inr(Math.max(...prices))}`) : "—"}</td>
                    <td className="a-td">{stock > 0 ? <Pill tone={stock < 10 ? "amber" : "green"}>{stock} in stock</Pill> : <Pill tone="red">Out of stock</Pill>}</td>
                    <td className="a-td">
                      <form action={toggleProduct.bind(null, p.id, !p.isActive)}>
                        <button
                          role="switch"
                          aria-checked={p.isActive}
                          aria-label={`Show ${p.name} on website`}
                          className={`flex h-7 w-12 items-center rounded-full p-0.5 ${p.isActive ? "justify-end bg-[#2e6b47]" : "justify-start bg-[#b9c6be]"}`}
                        >
                          <span className="h-6 w-6 rounded-full bg-white" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!products.length && <p className="py-8 text-center text-[#56685d]">No products found.</p>}
        </div>
      </div>
    </>
  );
}
