import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { productTypes } from "@/lib/catalog";

export default async function NewProduct() {
  await requireArea("products");
  const [concerns, types] = await Promise.all([db.concern.findMany({ orderBy: { sortOrder: "asc" } }), productTypes()]);
  return (
    <>
      <PageHeader title="Add product" />
      <ProductForm concerns={concerns.map((c) => ({ id: c.id, name: c.name }))} types={types} />
    </>
  );
}
