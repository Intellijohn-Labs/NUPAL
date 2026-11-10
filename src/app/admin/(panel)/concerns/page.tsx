import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONCERN_ICONS, iconPath } from "@/lib/icons";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { deleteConcern, saveConcern, saveConcernContent } from "./actions";
import { FaqFields } from "@/components/admin/FaqFields";

function IconSelect({ value, id }: { value?: string; id: string }) {
  return (
    <select id={id} name="icon" defaultValue={value ?? "leaf"} className="a-input">
      {Object.entries(CONCERN_ICONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
    </select>
  );
}

export default async function ConcernsPage() {
  await requireArea("concerns");
  const concerns = await db.concern.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });

  return (
    <>
      <PageHeader title="Health concerns" subtitle="The first six (by order) show as cards on the homepage with their short line; all of them are in the “Shop by Concern” menu." />
      <section className="a-card mb-5">
        <h2 className="mb-3 font-sans text-lg font-semibold">Add a concern</h2>
        <form action={saveConcern.bind(null, null)} className="grid gap-3 sm:grid-cols-[1fr_200px_110px_auto] sm:items-end">
          <div><label htmlFor="n-new" className="a-label">Name</label><input id="n-new" name="name" required className="a-input" placeholder="e.g. Kidney Health" /></div>
          <div><label htmlFor="i-new" className="a-label">Icon</label><IconSelect id="i-new" /></div>
          <div><label htmlFor="s-new" className="a-label">Order</label><input id="s-new" name="sortOrder" inputMode="numeric" defaultValue={concerns.length + 1} className="a-input" /></div>
          <SubmitButton>Add</SubmitButton>
        </form>
      </section>
      <div className="flex flex-col gap-3">
        {concerns.map((c) => (
          <div key={c.id} className="a-card flex flex-wrap items-end gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2ea]" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3E5A42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={iconPath(c.icon)} /></svg>
            </span>
            <form action={saveConcern.bind(null, c.id)} className="grid flex-1 gap-3 sm:grid-cols-[1fr_190px_90px_auto_auto] sm:items-end">
              <div><label htmlFor={`n-${c.id}`} className="a-label">Name</label><input id={`n-${c.id}`} name="name" defaultValue={c.name} className="a-input" /><input aria-label="Short line on the homepage card" name="tagline" defaultValue={c.tagline} placeholder="Short line, e.g. Everyday liver support" className="a-input mt-2" /></div>
              <div><label htmlFor={`i-${c.id}`} className="a-label">Icon</label><IconSelect id={`i-${c.id}`} value={c.icon} /></div>
              <div><label htmlFor={`o-${c.id}`} className="a-label">Order</label><input id={`o-${c.id}`} name="sortOrder" inputMode="numeric" defaultValue={c.sortOrder} className="a-input" /></div>
              <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={c.active} className="h-5 w-5 accent-[#2e6b47]" />Visible</label>
              <SubmitButton className="a-btn-ghost">Save</SubmitButton>
            </form>
            <form action={deleteConcern.bind(null, c.id)}>
              <ConfirmButton message={`Delete “${c.name}”? Products stay, but lose this concern.`}>Delete</ConfirmButton>
            </form>
            <p className="w-full text-xs text-[#56685d]">{c._count.products} products · <a href={`/concern/${c.slug}`} target="_blank" className="font-medium text-[#2e6b47]">View page ↗</a></p>
            <details className="w-full rounded-xl bg-[#f7faf8] p-3">
              <summary className="cursor-pointer text-sm font-semibold">Page content (intro and questions)</summary>
              <form action={saveConcernContent.bind(null, c.id)} className="mt-3 flex flex-col gap-3">
                <div>
                  <label htmlFor={`in-${c.id}`} className="a-label">Introduction</label>
                  <textarea id={`in-${c.id}`} name="intro" rows={4} defaultValue={c.intro} className="a-textarea" placeholder={`A few lines about ${c.name} in Ayurveda`} />
                  <p className="a-help">Shown at the top of the {c.name} page. Leave a blank line between paragraphs.</p>
                </div>
                <div>
                  <p className="a-label">Questions</p>
                  <FaqFields initial={(Array.isArray(c.faqs) ? c.faqs : []) as { q: string; a: string }[]} />
                </div>
                <div><SubmitButton>Save page content</SubmitButton></div>
              </form>
            </details>
          </div>
        ))}
      </div>
    </>
  );
}
