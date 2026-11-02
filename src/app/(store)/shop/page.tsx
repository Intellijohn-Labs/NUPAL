import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cardInclude, productTypes, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

export const metadata: Metadata = { title: "All products" };

type SP = Promise<{ q?: string; type?: string; brand?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const { q, type, brand } = await searchParams;
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(type ? { type } : {}),
    ...(brand ? { brand } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { shortDesc: { contains: q, mode: "insensitive" } },
            { concerns: { some: { concern: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };
  const [products, types] = await Promise.all([
    db.product.findMany({ where, include: cardInclude, orderBy: [{ isBestseller: "desc" }, { name: "asc" }] }),
    productTypes(),
  ]);
  const heading = q ? `Results for “${q}”` : brand ? brand : type ? type : "All products";

  return (
    <div className="container-x py-10 sm:py-14">
      <h1 className="text-[clamp(30px,3.6vw,44px)]">{heading}</h1>
      <p className="mt-1 text-muted">{products.length} {products.length === 1 ? "product" : "products"}</p>
      <div className="no-scrollbar my-6 flex gap-2 overflow-x-auto">
        <Link href="/shop" className={`chip shrink-0 ${!type && !brand && !q ? "border-sage bg-mist" : "border-line"}`}>All</Link>
        {types.map((t) => (
          <Link key={t} href={`/shop?type=${encodeURIComponent(t)}`} className={`chip shrink-0 ${type === t ? "border-sage bg-mist" : "border-line"}`}>
            {t}
          </Link>
        ))}
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-lg">No products match your search.</p>
          <p className="mt-2 text-muted">Try another word, or ask our doctor which medicine suits you.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn-outline">See all products</Link>
            <Link href="/consult" className="btn-primary">Consult an expert</Link>
          </div>
        </div>
      )}
    </div>
  );
}
