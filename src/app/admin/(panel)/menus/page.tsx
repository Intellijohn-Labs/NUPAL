import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { deleteGroup, deleteItem, saveGroup, saveItem } from "./actions";

export default async function MenusPage() {
  await requireArea("pages");
  const [groups, pages] = await Promise.all([
    db.menuGroup.findMany({ orderBy: { sortOrder: "asc" }, include: { items: { orderBy: { sortOrder: "asc" } } } }),
    db.page.findMany({ where: { published: true }, orderBy: { title: "asc" }, include: { blocks: { where: { anchor: { not: "" } }, orderBy: { sortOrder: "asc" }, select: { title: true, anchor: true } } } }),
  ]);
  // Suggestions for the link box: pages, their sections and the built-in pages.
  const suggestions = [
    ...pages.flatMap((p) => [{ href: `/${p.slug}`, label: p.title }, ...p.blocks.map((b) => ({ href: `/${p.slug}#${b.anchor}`, label: `${p.title} → ${b.title}` }))]),
    { href: "/stories", label: "Customer stories (videos)" },
    { href: "/reviews", label: "Customer reviews" },
    { href: "/results", label: "Real results" },
    { href: "/consult", label: "Consult a doctor" },
    { href: "/shop", label: "All products" },
  ];

  return (
    <>
      <PageHeader title="Menus" subtitle="Dropdown menus in the website header, such as “About us ▾”. Each item can open a page, a section of a page, or any link." />
      <datalist id="menu-links">
        {suggestions.map((s) => <option key={s.href} value={s.href}>{s.label}</option>)}
      </datalist>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <section key={g.id} className="a-card">
            <form action={saveGroup.bind(null, g.id)} className="flex flex-wrap items-end gap-3">
              <div className="flex-1"><label htmlFor={`g-${g.id}`} className="a-label">Menu name</label><input id={`g-${g.id}`} name="name" defaultValue={g.name} className="a-input" /></div>
              <div className="w-24"><label htmlFor={`go-${g.id}`} className="a-label">Order</label><input id={`go-${g.id}`} name="sortOrder" inputMode="numeric" defaultValue={g.sortOrder} className="a-input" /></div>
              <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={g.active} className="h-5 w-5 accent-[#2e6b47]" />Show in header</label>
              <SubmitButton className="a-btn-ghost">Save</SubmitButton>
            </form>
            <ul className="mt-4 flex flex-col gap-2 border-t border-[#e8eeea] pt-4">
              {g.items.map((it) => (
                <li key={it.id} className="flex flex-wrap items-end gap-2">
                  <form action={saveItem.bind(null, g.id, it.id)} className="grid flex-1 gap-2 sm:grid-cols-[1fr_1.4fr_80px_auto] sm:items-end">
                    <div><label htmlFor={`l-${it.id}`} className="a-label">Label</label><input id={`l-${it.id}`} name="label" defaultValue={it.label} className="a-input" /></div>
                    <div><label htmlFor={`h-${it.id}`} className="a-label">Opens</label><input id={`h-${it.id}`} name="href" list="menu-links" defaultValue={it.href} className="a-input" /></div>
                    <div><label htmlFor={`o-${it.id}`} className="a-label">Order</label><input id={`o-${it.id}`} name="sortOrder" inputMode="numeric" defaultValue={it.sortOrder} className="a-input" /></div>
                    <SubmitButton className="a-btn-ghost">Save</SubmitButton>
                  </form>
                  <form action={deleteItem.bind(null, it.id)}><ConfirmButton message={`Remove “${it.label}” from the menu?`}>Remove</ConfirmButton></form>
                </li>
              ))}
            </ul>
            <form action={saveItem.bind(null, g.id, null)} className="mt-3 grid gap-2 rounded-xl bg-[#f3f6f4] p-3 sm:grid-cols-[1fr_1.4fr_80px_auto] sm:items-end">
              <div><label htmlFor={`nl-${g.id}`} className="a-label">New item label</label><input id={`nl-${g.id}`} name="label" required className="a-input" /></div>
              <div><label htmlFor={`nh-${g.id}`} className="a-label">Opens</label><input id={`nh-${g.id}`} name="href" required list="menu-links" placeholder="Pick a page or section, or type a link" className="a-input" /></div>
              <div><label htmlFor={`no-${g.id}`} className="a-label">Order</label><input id={`no-${g.id}`} name="sortOrder" inputMode="numeric" defaultValue={g.items.length + 1} className="a-input" /></div>
              <SubmitButton>+ Add</SubmitButton>
            </form>
            <form action={deleteGroup.bind(null, g.id)} className="mt-3"><ConfirmButton message={`Delete the whole “${g.name}” menu?`} className="text-sm font-semibold text-[#a3361f]">Delete this menu</ConfirmButton></form>
          </section>
        ))}
        <form action={saveGroup.bind(null, null)} className="a-card flex flex-wrap items-end gap-3">
          <div className="flex-1"><label htmlFor="ng" className="a-label">Add a new menu</label><input id="ng" name="name" required placeholder="e.g. Ayurveda" className="a-input" /></div>
          <input type="hidden" name="sortOrder" value={groups.length + 1} />
          <SubmitButton>Add menu</SubmitButton>
        </form>
      </div>
    </>
  );
}
