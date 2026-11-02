import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { ResultsGallery } from "./ResultsGallery";

const pick = { id: true, patientId: true, beforeUrl: true, afterUrl: true, imageUrl: true } as const;

export async function ResultsSection() {
  let items = await db.result.findMany({ where: { status: "PUBLISHED", consent: true, featured: true }, orderBy: { sortOrder: "asc" }, take: 4, select: pick });
  if (!items.length) items = await db.result.findMany({ where: { status: "PUBLISHED", consent: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 4, select: pick });
  if (!items.length) return null;
  const s = await getSettings();

  return (
    <section aria-labelledby="results-h" className="bg-cream">
      <div className="container-x grid items-center gap-x-12 gap-y-6 py-16 sm:py-20 lg:grid-cols-[.85fr_1.6fr]">
        <Reveal from="left" className="flex flex-col items-start">
          <p className="text-[13px] font-medium uppercase tracking-[.08em] text-sage">Real results</p>
          <p className="mt-2 font-display text-[clamp(44px,5vw,60px)] leading-none">
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
