import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { iconPath } from "@/lib/icons";
import { ProductCard } from "@/components/store/ProductCard";

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const c = await db.concern.findUnique({ where: { slug: (await params).slug } });
  return { title: c ? `${c.name} – Ayurvedic medicines` : "Not found" };
}

export default async function ConcernPage({ params }: { params: P }) {
  const concern = await db.concern.findUnique({ where: { slug: (await params).slug } });
  if (!concern || !concern.active) notFound();
  const products = await db.product.findMany({
    where: { isActive: true, concerns: { some: { concernId: concern.id } } },
    include: cardInclude,
    orderBy: [{ isBestseller: "desc" }, { name: "asc" }],
  });

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mist">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3E5A42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={iconPath(concern.icon)} />
          </svg>
        </span>
        <div>
          <h1 className="text-[clamp(30px,3.6vw,44px)] leading-tight">{concern.name}</h1>
          <p className="text-muted">{products.length} {products.length === 1 ? "product" : "products"}</p>
        </div>
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
        </div>
      ) : (
        <p className="text-muted">No products for this concern yet.</p>
      )}
      <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-cream p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg">Not sure which medicine is right for you?</p>
        <Link href="/consult" className="btn-primary">Talk to a doctor</Link>
      </div>
    </div>
  );
}
