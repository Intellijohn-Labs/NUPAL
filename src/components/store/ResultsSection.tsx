import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { ResultsGallery } from "./ResultsGallery";
import { InnerEdge, TornEdge } from "./TornEdge";

const pick = { id: true, patientId: true, beforeUrl: true, afterUrl: true, imageUrl: true } as const;

/** `joinBelow`: the next section (consult) continues straight on with its own wavy edge, so skip the bottom edge. */
export async function ResultsSection({ joinAbove = false, joinBelow = false }: { joinAbove?: boolean; joinBelow?: boolean }) {
  let items = await db.result.findMany({ where: { status: "PUBLISHED", consent: true, featured: true }, orderBy: { sortOrder: "asc" }, take: 4, select: pick });
  if (!items.length) items = await db.result.findMany({ where: { status: "PUBLISHED", consent: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 4, select: pick });
  if (!items.length) return null;
  const s = await getSettings();

  return (
    <section aria-labelledby="results-h" className={`relative bg-mintband ${joinAbove ? "pt-6 sm:pt-8" : "mt-16 sm:mt-20"} ${joinBelow ? "" : "mb-16 sm:mb-20"}`}>
      {joinAbove ? <InnerEdge fill="#FDEDEA" at="top" /> : <TornEdge fill="#D9F0D4" at="top" />}
      {!joinBelow && <TornEdge fill="#D9F0D4" at="bottom" />}
      <div className="container-x grid grid-cols-1 items-center gap-x-12 [&>*]:min-w-0 gap-y-6 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-[.85fr_1.6fr]">
        <Reveal from="left" className="flex flex-col items-start">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2F6B2F]">Real results</p>
          <p className="mt-2 font-display text-[clamp(44px,5vw,60px)] leading-none text-maroon">
            <CountUp to={s.resultsCount} />+
          </p>
          <h2 id="results-h" className="mt-1 font-sans text-lg font-normal text-muted">hair regrowth results</h2>
          {s.resultsHook && <p className="mt-4 font-display text-[clamp(21px,2.2vw,26px)] leading-snug">{s.resultsHook}</p>}
          <Link href="/results" className="btn-primary mt-6 hidden lg:inline-flex">See all results →</Link>
        </Reveal>
        <ResultsGallery items={items} layout="home" />
        <div className="flex flex-col items-start gap-3 lg:col-span-2">
          <Link href="/results" className="btn-primary lg:hidden">See all results →</Link>
          <p className="text-xs text-muted">Results may vary from person to person.</p>
        </div>
      </div>
    </section>
  );
}
