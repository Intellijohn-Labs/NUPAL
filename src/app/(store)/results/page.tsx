import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { iconPath } from "@/lib/icons";
import { ResultsGallery } from "@/components/store/ResultsGallery";

export const metadata: Metadata = {
  title: "Real results",
  description: "Before and after photos from NUPAL Remedies patients.",
};

type SP = Promise<{ concern?: string }>;

export default async function ResultsPage({ searchParams }: { searchParams: SP }) {
  const { concern: picked } = await searchParams;
  const [all, concerns, s] = await Promise.all([
    db.result.findMany({
      where: { status: "PUBLISHED", consent: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, patientId: true, beforeUrl: true, afterUrl: true, imageUrl: true, concernIds: true },
    }),
    db.concern.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true, icon: true } }),
    getSettings(),
  ]);

  // A tile only appears for a concern that has at least one published result.
  const tiles = concerns
    .map((c) => ({ ...c, count: all.filter((r) => r.concernIds.includes(c.id)).length }))
    .filter((c) => c.count > 0);
  const active = tiles.find((c) => c.slug === picked) ?? null;
  const items = (active ? all.filter((r) => r.concernIds.includes(active.id)) : all).map(({ concernIds: _c, ...r }) => r); // eslint-disable-line @typescript-eslint/no-unused-vars

  const tile = (on: boolean) =>
    `flex min-h-[48px] shrink-0 snap-start items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm transition-colors ${
      on ? "border-[#174D36] bg-[#174D36] text-white" : "border-[#E7E4DA] bg-white text-[#174D36] hover:border-[#397C42]"
    }`;

  return (
    <div className="bg-cream">
      <div className="container-x py-10 sm:py-14">
        <p className="text-[13px] font-medium uppercase tracking-[.08em] text-sage">Real results</p>
        <h1 className="mt-1 text-[clamp(32px,4vw,48px)]">
          {active ? `${active.name} results` : `${s.resultsCount.toLocaleString("en-IN")}+ real results`}
        </h1>
        {s.resultsHook && !active && <p className="mt-2 font-display text-xl">{s.resultsHook}</p>}
        <p className="mt-2 text-muted">Tap any result to see it full screen. Results may vary from person to person.</p>

        {tiles.length > 0 && (
          <nav aria-label="Filter results by health concern" className="no-scrollbar -mx-4 mt-7 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href="/results" scroll={false} aria-current={!active ? "page" : undefined} className={tile(!active)}>
              <span className="font-medium">All</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${!active ? "bg-white/20" : "bg-[#EAF2E7] text-[#397C42]"}`}>{all.length}</span>
            </Link>
            {tiles.map((c) => {
              const on = active?.id === c.id;
              return (
                <Link key={c.id} href={`/results?concern=${c.slug}`} scroll={false} aria-current={on ? "page" : undefined} className={tile(on)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={on ? "text-[#E7C88F]" : "text-[#397C42]"}>
                    <path d={iconPath(c.icon)} />
                  </svg>
                  <span className="whitespace-nowrap font-medium">{c.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${on ? "bg-white/20" : "bg-[#EAF2E7] text-[#397C42]"}`}>{c.count}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {items.length ? (
          <ResultsGallery key={active?.id ?? "all"} items={items} step={12} className="mt-8" />
        ) : (
          <p className="mt-8 text-muted">Results are coming soon.</p>
        )}
        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg">{active ? `Want to know if this is right for your ${active.name.toLowerCase()}?` : "Want to know if this is right for you?"}</p>
          <Link href={active ? `/consult?concern=${active.slug}` : "/consult"} className="btn-primary">Talk to our doctor</Link>
        </div>
      </div>
    </div>
  );
}
