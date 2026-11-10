import Link from "next/link";
import type { ResultStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Pill } from "@/components/admin/PageHeader";
import { ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { ResultsInbox } from "@/components/admin/ResultsInbox";
import { deleteResult, setResultStatus, swapResult, tagUntaggedResults, toggleResultFeatured, updateResult } from "./actions";

const PER_PAGE = 48;
type SP = Promise<{ tab?: string; q?: string; page?: string; dup?: string; tagged?: string }>;

export default async function ResultsAdmin({ searchParams }: { searchParams: SP }) {
  await requireArea("results");
  const sp = await searchParams;
  const tab = ["inbox", "DRAFT", "PUBLISHED", "HIDDEN"].includes(sp.tab ?? "") ? sp.tab! : "inbox";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const [inboxCount, counts, featuredCount, concerns, untagged] = await Promise.all([
    db.resultUpload.count(),
    db.result.groupBy({ by: ["status"], _count: true }),
    db.result.count({ where: { featured: true } }),
    db.concern.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.result.count({ where: { concernIds: { isEmpty: true } } }),
  ]);
  const count = (s: ResultStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const tabs: [string, string, number][] = [
    ["inbox", "Photo inbox", inboxCount],
    ["DRAFT", "Drafts", count("DRAFT")],
    ["PUBLISHED", "Published", count("PUBLISHED")],
    ["HIDDEN", "Hidden", count("HIDDEN")],
  ];

  const uploads = tab === "inbox" ? await db.resultUpload.findMany({ orderBy: [{ patientId: "asc" }, { createdAt: "asc" }], take: 600 }) : [];
  const ids = [...new Set(uploads.map((u) => u.patientId).filter(Boolean))];
  const existingIds = ids.length ? (await db.result.findMany({ where: { patientId: { in: ids } }, select: { patientId: true } })).map((r) => r.patientId) : [];
  const dupGroups = await db.result.groupBy({ by: ["patientId"], _count: true, having: { patientId: { _count: { gt: 1 } } } });
  const dupSet = new Set(dupGroups.map((g) => g.patientId));
  const where = tab !== "inbox" ? { status: tab as ResultStatus, ...(q ? { patientId: { contains: q, mode: "insensitive" as const } } : {}) } : undefined;
  const [results, total] =
    tab !== "inbox"
      ? await Promise.all([
          db.result.findMany({ where, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
          db.result.count({ where }),
        ])
      : [[], 0];
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <PageHeader title="Real results" subtitle="Upload before/after photos, pair them, and publish. Up to 4 published results can be shown on the homepage." />
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-[#e3eae5] p-1 sm:inline-flex">
        {tabs.map(([k, l, n]) => (
          <Link key={k} href={`/admin/results?tab=${k}`} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === k ? "bg-white" : "text-[#56685d]"}`}>
            {l} ({n})
          </Link>
        ))}
      </div>

      {sp.tagged !== undefined && (
        <p role="status" className="mb-4 rounded-lg bg-[#e3eae5] px-4 py-3 text-sm text-[#1f4d36]">
          {sp.tagged} result{sp.tagged === "1" ? "" : "s"} tagged. Their concern tile now shows on the Real Results page.
        </p>
      )}

      {untagged > 0 && concerns.length > 0 && (
        <form action={tagUntaggedResults} className="mb-5 flex flex-col gap-3 rounded-xl border border-[#e2c98f] bg-[#fdf6e6] p-4 sm:flex-row sm:items-center">
          <input type="hidden" name="tab" value={tab} />
          <p className="flex-1 text-sm text-[#5b4a1f]">
            <strong>{untagged} result{untagged === 1 ? " has" : "s have"} no health concern.</strong> Untagged results only show under “All” on the Real Results page, and they don’t create a filter tile.
          </p>
          <label htmlFor="tag-concern" className="sr-only">Health concern</label>
          <select id="tag-concern" name="concernId" required defaultValue={concerns.find((c) => /hair/i.test(c.name))?.id ?? ""} className="a-input sm:w-56">
            <option value="" disabled>Choose a concern…</option>
            {concerns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <SubmitButton>Tag all {untagged}</SubmitButton>
        </form>
      )}

      {sp.dup && (
        <p role="alert" className="mb-4 rounded-lg bg-[#fbe6e0] px-4 py-3 text-sm text-[#a3361f]">
          Not saved: another result already uses patient ID {sp.dup}. <Link href={`/admin/results?tab=PUBLISHED&q=${encodeURIComponent(sp.dup)}`} className="font-semibold underline">Find it</Link>
        </p>
      )}
      {dupSet.size > 0 && tab !== "inbox" && (
        <p className="mb-4 rounded-lg bg-[#f8edd2] px-4 py-3 text-sm text-[#7a5410]">
          {dupSet.size} patient {dupSet.size === 1 ? "ID is" : "IDs are"} used by more than one result: {[...dupSet].slice(0, 6).map((id, i) => (
            <span key={id}>{i ? ", " : ""}<Link href={`/admin/results?tab=${tab}&q=${encodeURIComponent(id)}`} className="font-semibold underline">{id}</Link></span>
          ))}
          {dupSet.size > 6 ? "…" : ""}
        </p>
      )}
      {tab === "inbox" ? (
        <ResultsInbox existingIds={existingIds} uploads={uploads.map((u) => ({ id: u.id, url: u.url, filename: u.filename, patientId: u.patientId, role: u.role }))} />
      ) : (
        <>
          <form className="mb-4 flex gap-2">
            <input type="hidden" name="tab" value={tab} />
            <label htmlFor="rq" className="sr-only">Search by patient ID</label>
            <input id="rq" name="q" defaultValue={q} placeholder="Search patient ID" className="a-input max-w-xs" />
            <button className="a-btn-ghost">Search</button>
          </form>
          {tab === "PUBLISHED" && <p className="mb-3 text-sm text-[#56685d]">{featuredCount} of 4 homepage spots used.</p>}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((r) => (
              <article key={r.id} className="a-card flex flex-col gap-3 p-3">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt="" className="aspect-[2/1] w-full rounded-xl bg-[#f3f6f4] object-contain" />
                ) : (
                  <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
                    <figure className="relative m-0"><img src={r.beforeUrl!} alt="" className="aspect-square w-full object-cover" /><span className="absolute bottom-1 left-1 rounded bg-white px-1.5 text-xs font-semibold">Before</span></figure>
                    <figure className="relative m-0"><img src={r.afterUrl!} alt="" className="aspect-square w-full object-cover" /><span className="absolute bottom-1 left-1 rounded bg-[#1f3d2b] px-1.5 text-xs font-semibold text-white">After</span></figure>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {r.featured && <Pill tone="blue">On homepage</Pill>}
                  {r.consent ? <Pill tone="green">Permission given</Pill> : <Pill tone="amber">No permission yet</Pill>}
                  {dupSet.has(r.patientId) && <Pill tone="red">Same ID as another result</Pill>}
                </div>
                <form action={updateResult.bind(null, r.id)} className="grid grid-cols-[1fr_80px] gap-2">
                  <div><label htmlFor={`pi-${r.id}`} className="a-label">Patient ID</label><input id={`pi-${r.id}`} name="patientId" defaultValue={r.patientId} className="a-input" /></div>
                  <div><label htmlFor={`so-${r.id}`} className="a-label">Order</label><input id={`so-${r.id}`} name="sortOrder" inputMode="numeric" defaultValue={r.sortOrder} className="a-input" /></div>
                  <fieldset className="col-span-2">
                    <legend className="a-label">Health concerns</legend>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {concerns.map((c) => (
                        <label key={c.id} className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="concerns" value={c.id} defaultChecked={r.concernIds.includes(c.id)} className="h-4 w-4 accent-[#2e6b47]" />{c.name}</label>
                      ))}
                    </div>
                    <p className="a-help">The result also appears on these concern pages.</p>
                  </fieldset>
                  <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" name="consent" defaultChecked={r.consent} className="h-5 w-5 accent-[#2e6b47]" />Customer gave permission</label>
                  <div className="col-span-2"><SubmitButton className="a-btn-ghost h-9">Save</SubmitButton></div>
                </form>
                <div className="flex flex-wrap gap-2 border-t border-[#e8eeea] pt-3">
                  {r.status !== "PUBLISHED" && (
                    r.consent ? <form action={setResultStatus.bind(null, r.id, "PUBLISHED")}><button className="a-btn h-9">Publish</button></form>
                              : <span className="self-center text-xs text-[#7a5410]">Tick permission to publish</span>
                  )}
                  {r.status === "PUBLISHED" && (
                    <form action={toggleResultFeatured.bind(null, r.id, !r.featured)}>
                      <button className="a-btn-ghost h-9" disabled={!r.featured && featuredCount >= 4}>{r.featured ? "Remove from homepage" : "Show on homepage"}</button>
                    </form>
                  )}
                  {r.status === "PUBLISHED" && <form action={setResultStatus.bind(null, r.id, "HIDDEN")}><button className="a-btn-ghost h-9">Hide</button></form>}
                  {r.beforeUrl && <form action={swapResult.bind(null, r.id)}><button className="a-btn-ghost h-9">⇆ Swap</button></form>}
                  <form action={deleteResult.bind(null, r.id)}><ConfirmButton message="Delete this result and its photos?" className="a-btn-danger h-9">Delete</ConfirmButton></form>
                </div>
              </article>
            ))}
          </div>
          {!results.length && <p className="a-card text-center text-[#56685d]">{q ? "No results match that patient ID." : "Nothing here yet."}</p>}
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-5 flex flex-wrap justify-center gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={`/admin/results?tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${n}`} aria-current={n === page ? "page" : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold ${n === page ? "bg-[#2e6b47] text-white" : "border border-[#dce5df] bg-white"}`}>{n}</Link>
              ))}
            </nav>
          )}
        </>
      )}
    </>
  );
}
