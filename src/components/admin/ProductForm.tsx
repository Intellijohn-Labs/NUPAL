"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/(panel)/products/actions";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./ui";

type V = { id: string; label: string; mrp: number | ""; price: number | ""; stock: number | ""; sku: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  type: string;
  brand: string;
  shortDesc: string;
  description: string;
  ingredients: string;
  dosage: string;
  benefits: string[];
  faqs: { q: string; a: string }[];
  images: string[];
  videoUrl: string;
  isActive: boolean;
  isBestseller: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDesc: string;
  concernIds: string[];
  variants: V[];
};

const DEFAULT_TYPES = ["Capsule", "Tablet", "Syrup", "Oil", "Cream & Ointment", "Rasayanam & Lepam", "Granules", "Churna", "Shampoo", "Hygiene Wash"];
const blankV = (): V => ({ id: "", label: "", mrp: "", price: "", stock: "", sku: "" });

export function ProductForm({ product, concerns, types }: { product?: Product; concerns: { id: string; name: string }[]; types: string[] }) {
  const [error, action] = useActionState(saveProduct.bind(null, product?.id ?? null), null);
  const [variants, setVariants] = useState<V[]>(product?.variants.length ? product.variants : [blankV()]);
  const [faqs, setFaqs] = useState(product?.faqs ?? []);
  const allTypes = Array.from(new Set([...DEFAULT_TYPES, ...types]));

  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-5">
        <section className="a-card flex flex-col gap-4">
          <h2 className="font-sans text-lg font-semibold">Basic details</h2>
          <div>
            <label htmlFor="name" className="a-label">Product name</label>
            <input id="name" name="name" required defaultValue={product?.name} className="a-input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="a-label">Product type</label>
              <input id="type" name="type" list="types" required defaultValue={product?.type} className="a-input" placeholder="e.g. Capsule" />
              <datalist id="types">{allTypes.map((t) => <option key={t} value={t} />)}</datalist>
            </div>
            <div>
              <label htmlFor="brand" className="a-label">Range / brand (optional)</label>
              <input id="brand" name="brand" defaultValue={product?.brand} className="a-input" placeholder="e.g. MONOEXTRACTS" />
            </div>
          </div>
          <div>
            <label htmlFor="shortDesc" className="a-label">One-line description</label>
            <input id="shortDesc" name="shortDesc" maxLength={120} defaultValue={product?.shortDesc} className="a-input" placeholder="Shown on product cards" />
          </div>
          <div>
            <label htmlFor="description" className="a-label">Full description</label>
            <textarea id="description" name="description" rows={6} defaultValue={product?.description} className="a-textarea" />
            <p className="a-help">Use a blank line between paragraphs. **bold** and - bullet lists work.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ingredients" className="a-label">Ingredients</label>
              <textarea id="ingredients" name="ingredients" rows={4} defaultValue={product?.ingredients} className="a-textarea" />
            </div>
            <div>
              <label htmlFor="dosage" className="a-label">Dosage and how to use</label>
              <textarea id="dosage" name="dosage" rows={4} defaultValue={product?.dosage} className="a-textarea" />
            </div>
          </div>
          <div>
            <label htmlFor="benefits" className="a-label">Benefits</label>
            <textarea id="benefits" name="benefits" rows={4} defaultValue={product?.benefits.join("\n")} className="a-textarea" />
            <p className="a-help">One benefit per line. Shown as ticks on the product page.</p>
          </div>
        </section>

        <section className="a-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold">Pack sizes, prices and stock</h2>
            <button type="button" className="a-btn-ghost" onClick={() => setVariants((v) => [...v, blankV()])}>+ Add pack size</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="a-th">Pack size</th>
                  <th className="a-th">MRP (₹)</th>
                  <th className="a-th">Selling price (₹)</th>
                  <th className="a-th">Stock</th>
                  <th className="a-th">SKU</th>
                  <th className="a-th" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id || `new-${i}`}>
                    <td className="py-1.5 pr-2">
                      <input type="hidden" name="v_id" value={v.id} />
                      <input name="v_label" aria-label="Pack size" defaultValue={v.label} placeholder="e.g. 50 caps" className="a-input" />
                    </td>
                    <td className="py-1.5 pr-2"><input name="v_mrp" aria-label="MRP" inputMode="numeric" defaultValue={v.mrp} className="a-input" /></td>
                    <td className="py-1.5 pr-2"><input name="v_price" aria-label="Selling price" inputMode="numeric" defaultValue={v.price} className="a-input" /></td>
                    <td className="py-1.5 pr-2"><input name="v_stock" aria-label="Stock" inputMode="numeric" defaultValue={v.stock} className="a-input" /></td>
                    <td className="py-1.5 pr-2"><input name="v_sku" aria-label="SKU" defaultValue={v.sku} className="a-input" /></td>
                    <td className="py-1.5">
                      {variants.length > 1 && (
                        <button type="button" className="text-sm font-semibold text-[#a3361f]" onClick={() => setVariants((x) => x.filter((_, k) => k !== i))}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="a-help">If MRP is higher than the selling price, the website shows the discount automatically.</p>
        </section>

        <section className="a-card flex flex-col gap-3">
          <h2 className="font-sans text-lg font-semibold">Photos</h2>
          <ImageField name="images" folder="products" square maxSide={1200} existing={product?.images} help="Any shape works — white borders are trimmed and the product is centred on a square automatically. First photo is the cover." />
          <div>
            <label htmlFor="videoUrl" className="a-label">Video link (optional)</label>
            <input id="videoUrl" name="videoUrl" type="url" defaultValue={product?.videoUrl} placeholder="https://www.youtube.com/watch?v=…" className="a-input" />
            <p className="a-help">Shown as the last item in the product’s photos, with a play button. Unlisted YouTube videos work.</p>
          </div>
        </section>

        <section className="a-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold">FAQs</h2>
            <button type="button" className="a-btn-ghost" onClick={() => setFaqs((x) => [...x, { q: "", a: "" }])}>+ Add question</button>
          </div>
          {faqs.length === 0 && <p className="text-sm text-[#56685d]">No questions yet.</p>}
          {faqs.map((q, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-[#e8eeea] p-3">
              <input name="faq_q" aria-label="Question" defaultValue={q.q} placeholder="Question" className="a-input" />
              <textarea name="faq_a" aria-label="Answer" defaultValue={q.a} rows={2} placeholder="Answer" className="a-textarea" />
              <button type="button" className="justify-self-start text-sm font-semibold text-[#a3361f]" onClick={() => setFaqs((x) => x.filter((_, k) => k !== i))}>
                Remove question
              </button>
            </div>
          ))}
        </section>
      </div>

      <div className="flex flex-col gap-5 xl:sticky xl:top-6">
        <section className="a-card flex flex-col gap-3">
          <label className="flex items-center gap-3 text-[15px]">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="h-5 w-5 accent-[#2e6b47]" />
            Show on website
          </label>
          <label className="flex items-center gap-3 text-[15px]">
            <input type="checkbox" name="isBestseller" defaultChecked={product?.isBestseller} className="h-5 w-5 accent-[#2e6b47]" />
            Mark as bestseller
          </label>
          <div>
            <label htmlFor="sortOrder" className="a-label">Position in lists</label>
            <input id="sortOrder" name="sortOrder" inputMode="numeric" defaultValue={product?.sortOrder ?? 0} className="a-input" />
            <p className="a-help">Lower numbers appear first. Leave 0 to sort by name.</p>
          </div>
          {error && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
          <SubmitButton className="a-btn h-11">{product ? "Save changes" : "Add product"}</SubmitButton>
        </section>
        <section className="a-card">
          <h2 className="mb-3 font-sans text-lg font-semibold">Health concerns</h2>
          <div className="flex flex-col gap-2">
            {concerns.map((c) => (
              <label key={c.id} className="flex items-center gap-3 text-[15px]">
                <input type="checkbox" name="concerns" value={c.id} defaultChecked={product?.concernIds.includes(c.id)} className="h-5 w-5 accent-[#2e6b47]" />
                {c.name}
              </label>
            ))}
          </div>
        </section>
        <details className="a-card group">
          <summary className="flex cursor-pointer list-none items-center justify-between font-sans text-lg font-semibold">
            Google search (optional)
            <span aria-hidden="true" className="text-sm text-[#56685d] group-open:rotate-180">▾</span>
          </summary>
          <p className="mt-2 text-sm text-[#56685d]">Leave empty to use the product name and one-line description. Fill in only if you want Google to show different words.</p>
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="seoTitle" className="a-label">Title in Google</label>
              <input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={product?.seoTitle} placeholder={product?.name || "Uses the product name"} className="a-input" />
            </div>
            <div>
              <label htmlFor="seoDesc" className="a-label">Description in Google</label>
              <textarea id="seoDesc" name="seoDesc" rows={3} maxLength={160} defaultValue={product?.seoDesc} placeholder="Uses the one-line description" className="a-textarea" />
            </div>
            <div>
              <label htmlFor="slug" className="a-label">Web address</label>
              <input id="slug" name="slug" defaultValue={product?.slug} placeholder="Made from the name" className="a-input" />
              <p className="a-help">Changing this breaks links people have already shared.</p>
            </div>
          </div>
        </details>
      </div>
    </form>
  );
}
