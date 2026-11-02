import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { productTypes } from "@/lib/catalog";
import { Flash, PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmButton } from "@/components/admin/ui";
import { deleteProduct } from "../actions";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireArea("products");
  const { id } = await params;
  const { saved } = await searchParams;
  const [p, concerns, types] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } }, concerns: true } }),
    db.concern.findMany({ orderBy: { sortOrder: "asc" } }),
    productTypes(),
  ]);
  if (!p) notFound();

  return (
    <>
      <PageHeader title={p.name} subtitle={`/product/${p.slug}`}>
        <Link href={`/product/${p.slug}`} target="_blank" className="a-btn-ghost">View on website ↗</Link>
        <form action={deleteProduct.bind(null, p.id)}>
          <ConfirmButton message={`Delete ${p.name}? If it has orders it will be hidden instead.`}>Delete</ConfirmButton>
        </form>
      </PageHeader>
      <Flash show={!!saved}>Saved. Changes are live on the website.</Flash>
      <ProductForm
        concerns={concerns.map((c) => ({ id: c.id, name: c.name }))}
        types={types}
        product={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: p.type,
          brand: p.brand ?? "",
          shortDesc: p.shortDesc,
          description: p.description,
          ingredients: p.ingredients,
          dosage: p.dosage,
          benefits: p.benefits,
          faqs: (Array.isArray(p.faqs) ? p.faqs : []) as { q: string; a: string }[],
          images: p.images,
          videoUrl: p.videoUrl ?? "",
          isActive: p.isActive,
          isBestseller: p.isBestseller,
          sortOrder: p.sortOrder,
          seoTitle: p.seoTitle ?? "",
          seoDesc: p.seoDesc ?? "",
          concernIds: p.concerns.map((c) => c.concernId),
          variants: p.variants.map((v) => ({ id: v.id, label: v.label, mrp: v.mrp, price: v.price, stock: v.stock, sku: v.sku ?? "" })),
        }}
      />
    </>
  );
}
