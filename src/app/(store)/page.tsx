import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { BannerSlider } from "@/components/store/BannerSlider";
import { ConcernShelf } from "@/components/store/ConcernShelf";
import { Collections, type Collection } from "@/components/store/Collections";
import { CustomerStories } from "@/components/store/CustomerStories";
import { FinalCta } from "@/components/store/FinalCta";
import { getSettings } from "@/lib/settings";
import { ResultsSection } from "@/components/store/ResultsSection";
import { HeritageBand, type Heritage } from "@/components/store/HeritageBand";
import { DnaThread } from "@/components/store/ScrollFx";
import { ConsultBand } from "@/components/store/ConsultBand";

export default async function HomePage() {
  const [banners, concerns, products, doctors, types, settings] = await Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.concern.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.product.findMany({
      where: { isActive: true },
      include: cardInclude,
      orderBy: [{ isBestseller: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.doctor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.consultationType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);
  const why = (Array.isArray(settings.whyPoints) ? (settings.whyPoints as { title?: string; text?: string }[]) : [])
    .filter((w) => w?.title)
    .map((w) => ({ title: String(w.title), text: String(w.text ?? "") }));
  // Products shown in the hero composition: bestsellers first, those with photos preferred.
  // Hero composition always uses the drawn product art (not uploaded photos), so it stays consistent.
  const heroProducts = products.slice(0, 3).map((p) => ({ name: p.name, type: p.type, image: null }));

  // Which bands meet directly, so their wavy edges join without a gap.
  const hasResults = (await db.result.count({ where: { status: "PUBLISHED", consent: true } })) > 0;
  const hasConsult = doctors.length > 0;
  const resultsJoinConsult = hasResults && hasConsult;
  const bestJoinResults = hasResults && products.length > 0;
  const collections = (Array.isArray(settings.homeCollections) ? settings.homeCollections : []) as Collection[];
  const waDigits = settings.whatsappNumber.replace(/\D/g, "");
  const heritage = (settings.heritage && typeof settings.heritage === "object" && !Array.isArray(settings.heritage) ? settings.heritage : {}) as Heritage;

  return (
    <div className="relative">
      <BannerSlider banners={banners} products={heroProducts} trust={settings.heroChips} />

      <ConcernShelf
        concerns={concerns.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, tagline: c.tagline }))}
        products={products.map(toCard)}
        bestsellers={products.slice(0, 4).map(toCard)}
        joinBelow={bestJoinResults}
      />

      <ResultsSection joinAbove={bestJoinResults} joinBelow={resultsJoinConsult} />

      {hasConsult && (
        <ConsultBand
          doctors={doctors.map((d) => ({ id: d.id, name: d.name, qualifications: d.qualifications, experience: d.experience, photo: d.photo }))}
          types={types.map((t) => ({ name: t.name, fee: t.fee }))}
          waDigits={waDigits}
        />
      )}

      <HeritageBand h={heritage} proof={why} joinAbove={hasConsult} />

      <Collections items={collections} />

      <CustomerStories />

      <FinalCta />

      <DnaThread startId="concerns" />
    </div>
  );
}
