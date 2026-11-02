import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { Flash, PageHeader } from "@/components/admin/PageHeader";
import { PageForm } from "@/components/admin/PageForm";
import { ConfirmButton } from "@/components/admin/ui";
import { deletePage } from "../actions";
import { addBlock, deleteBlock, moveBlock } from "../block-actions";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { BLOCK_LABELS, BLOCK_TYPES } from "@/lib/blocks";

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireArea("pages");
  const { id } = await params;
  const { saved } = await searchParams;
  const page = id === "new" ? null : await db.page.findUnique({ where: { id }, include: { blocks: { orderBy: { sortOrder: "asc" } } } });
  if (id !== "new" && !page) notFound();
  return (
    <>
      <PageHeader title={page?.title ?? "New page"}>
        {page && <Link href={`/${page.slug}`} target="_blank" className="a-btn-ghost">View page ↗</Link>}
        {page && (
          <form action={deletePage.bind(null, page.id)}>
            <ConfirmButton message={`Delete “${page.title}”?`}>Delete</ConfirmButton>
          </form>
        )}
      </PageHeader>
      <Flash show={!!saved}>Saved. The page is updated on the website.</Flash>
      <PageForm page={page} />

      {page && (
        <section className="mt-8" aria-labelledby="sections-h">
          <h2 id="sections-h" className="font-sans text-xl font-semibold">Page sections</h2>
          <p className="mt-1 text-sm text-[#56685d]">
            Sections appear below the main text, in this order. With two or more titled sections, the page shows a section menu visitors can use to jump around.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {page.blocks.map((b, i) => (
              <details key={b.id} className="a-card" open={page.blocks.length <= 2}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-xs font-bold text-[#1e5a36]">{BLOCK_LABELS[b.type]?.name ?? b.type}</span>
                  <span className="flex-1 font-semibold">{b.title || "Untitled section"}</span>
                </summary>
                <div className="mt-4 border-t border-[#e8eeea] pt-4">
                  <BlockEditor block={{ id: b.id, type: b.type, title: b.title, anchor: b.anchor, data: b.data }} pageSlug={page.slug} />
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e8eeea] pt-3">
                    <form action={moveBlock.bind(null, b.id, -1)}><button className="a-btn-ghost h-9" disabled={i === 0}>↑ Move up</button></form>
                    <form action={moveBlock.bind(null, b.id, 1)}><button className="a-btn-ghost h-9" disabled={i === page.blocks.length - 1}>↓ Move down</button></form>
                    <form action={deleteBlock.bind(null, b.id)}><ConfirmButton message="Delete this section?" className="a-btn-danger h-9">Delete section</ConfirmButton></form>
                  </div>
                </div>
              </details>
            ))}
          </div>
          <div className="a-card mt-4">
            <p className="a-label">Add a section</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {BLOCK_TYPES.map((t) => (
                <form key={t} action={addBlock.bind(null, page.id, t)}>
                  <button className="flex h-full w-full flex-col items-start gap-0.5 rounded-xl border border-[#dce5df] bg-white p-3 text-left hover:border-[#2e6b47]">
                    <span className="font-semibold">+ {BLOCK_LABELS[t].name}</span>
                    <span className="text-xs text-[#56685d]">{BLOCK_LABELS[t].help}</span>
                  </button>
                </form>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
