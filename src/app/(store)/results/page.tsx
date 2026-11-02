import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ResultsGallery } from "@/components/store/ResultsGallery";

export const metadata: Metadata = {
  title: "Real hair regrowth results",
  description: "Before and after photos from NUPAL Remedies patients.",
};

export default async function ResultsPage() {
  const [items, s] = await Promise.all([
    db.result.findMany({
      where: { status: "PUBLISHED", consent: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, patientId: true, beforeUrl: true, afterUrl: true, imageUrl: true },
    }),
    getSettings(),
  ]);

  return (
    <div className="bg-cream">
      <div className="container-x py-10 sm:py-14">
        <p className="text-[13px] font-medium uppercase tracking-[.08em] text-sage">Real results</p>
        <h1 className="mt-1 text-[clamp(32px,4vw,48px)]">{s.resultsCount.toLocaleString("en-IN")}+ hair regrowth results</h1>
        {s.resultsHook && <p className="mt-2 font-display text-xl">{s.resultsHook}</p>}
        <p className="mt-2 text-muted">Tap any result to see it full screen. Results may vary from person to person.</p>
        {items.length ? (
          <ResultsGallery items={items} step={12} className="mt-8" />
        ) : (
          <p className="mt-8 text-muted">Results are coming soon.</p>
        )}
        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg">Want to know if this is right for you?</p>
          <Link href="/consult" className="btn-primary">Talk to our doctor</Link>
        </div>
      </div>
    </div>
  );
}
