import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import type { CertsData, GalleryData, UnitData } from "@/lib/blocks";
import { CountUp } from "@/components/store/CountUp";
import { Reveal } from "@/components/store/Reveal";
import { FinalCta } from "@/components/store/FinalCta";
import { CertStrip, type Cert } from "@/components/store/CertStrip";
import { StoryBanner, Arch } from "@/components/store/StoryBanner";
import { UnitVideo } from "@/components/store/UnitVideo";
import { parseVideo } from "@/lib/video";

export const metadata: Metadata = {
  title: "Quality & Research",
  description:
    "Tested at every step, trusted since 1960. How Nupal Ayurveda checks every batch in its own laboratory in Kochi, from the herbs we buy to the medicine you take.",
  alternates: { canonical: "/quality-research" },
};

/*
 * Quality & Research page, following "Nupal Ayurveda Quality & Research Page Direction" (Nov 2026).
 * Sections: hero · proof numbers + herb-to-home journey · promise + tests · instruments · Kochi unit ·
 * certificates · research + business services · FAQ · closing call to action. (The batch check is left out.)
 * Lab photos come from the old R&D page (public/quality); certificates from the Accreditations page.
 */

const PROOF: [number, string, boolean][] = [
  [7, "Laboratory instruments", false],
  [5, "Core test types", false],
  [4, "Quality certifications", false],
  [1960, "Making Ayurveda in Kochi", true],
];

const JOURNEY: [string, string][] = [
  ["Herbs checked on arrival", "Raw materials are analysed before they enter production."],
  ["Made the classical way", "Prepared as per age-old manuscripts."],
  ["Watched in the plant", "Technical staff inspect every stage of production."],
  ["Finished medicine tested", "Analysed as per pharmacopoeia standards."],
  ["Stability studies", "We check how each medicine holds up over time."],
  ["Packed and dispatched", "Careful storage, packing and dispatch."],
];

const PILLARS: [string, string][] = [
  ["Purity", "Tested for heavy metals, pesticide residue and microbes."],
  ["Authenticity", "Herbs identified and profiled before they are used."],
  ["Consistency", "Every batch checked, and stability studied over time."],
];

// 24×24 line icons
const I = {
  metal: "M6 20h12M8 20V9l4-5 4 5v11M10 13h4",
  leaf: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8",
  microbe: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1",
  print: "M12 3v18M7 6c3 2 7 2 10 0M5 11c4 2 10 2 14 0M7 16c3 2 7 2 10 0",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4",
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9",
};

const TESTS: [string, string, string][] = [
  ["Heavy metals", "Looks for traces of heavy metals in herbs and finished medicines.", I.metal],
  ["Pesticide residue", "Looks for leftover pesticides on the herbs we buy.", I.leaf],
  ["Microbes", "Tests for microbial contamination.", I.microbe],
  ["Herb fingerprint", "Identifies the natural compounds that make each herb what it is.", I.print],
  ["Stability", "Checks how the medicine holds up over its shelf life.", I.clock],
];

const INSTRUMENTS: [string, string, string | null][] = [
  ["HPLC", "Measures the key compounds in a sample.", "/quality/hplc.webp"],
  ["HPTLC", "Creates a chemical fingerprint of each herb.", "/quality/hptlc.webp"],
  ["Gas Chromatography", "Checks volatile oils, solvents and pesticide residue.", "/quality/gas-chromatography.webp"],
  ["Atomic Absorption", "Detects heavy and trace metals.", "/quality/aas.webp"],
  ["UV-Visible Spectrometer", "Measures compounds by how they absorb light.", null],
  ["Rotary Vacuum Evaporator", "Gently concentrates plant extracts.", "/quality/rotary-evaporator.webp"],
  ["Microwave Digestion", "Prepares samples for metal testing.", "/quality/microwave-digestion.webp"],
];


const SERVICES = [
  "Ayurveda raw material and finished product analysis",
  "Stability studies",
  "Heavy metals, pesticide residue and microbiological testing",
  "Water analysis, spices and condiments",
  "Oils and fats, herbal cosmetics",
  "Method development and contract research",
];

const FAQS: [string, string][] = [
  ["Is every batch tested?", "Yes. Raw materials, in-process steps and finished medicines are checked at our own laboratory in Kochi."],
  ["Where are Nupal products made?", "At our own unit in Kadavanthra, Kochi, Kerala, where every batch begins."],
  ["Are Nupal products GMP certified?", "Yes. We hold a GMP certificate from the Drugs Control Administration, Government of Kerala, are WHO-GMP and ISO 9001:2015 certified, and hold the AYUSH Quality Mark."],
  ["Can I see your certificates?", "Yes. Tap any certificate on this page to open it full size, or see them all on our Accreditations page."],
  ["Do you test for heavy metals and pesticides?", "Yes. Herbs and finished medicines are tested for heavy metals, pesticide residue and microbial contamination."],
];

const CERT_PICKS: [RegExp, string][] = [
  [/(^|[^o-])gmp-certificate/i, "GMP"],
  [/who-gmp/i, "WHO-GMP"],
  [/iso-9001/i, "ISO 9001"],
  [/ayush-quality-mark/i, "Ayush"],
  [/moh-uae|uae/i, "UAE MoH"],
  [/malaysia/i, "Malaysia"],
];

function Svg({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-[12px] font-semibold uppercase tracking-[.18em] ${light ? "text-[#E7C88F]" : "text-[#397C42]"}`}>{children}</p>;
}

function H2({ id, children, light = false }: { id: string; children: React.ReactNode; light?: boolean }) {
  return <h2 id={id} className={`mt-2 text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight ${light ? "text-white" : "text-[#174D36]"}`}>{children}</h2>;
}

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 border-b-2 border-[#84B641] font-medium text-[#174D36] transition-colors hover:border-[#174D36]">
      {children}
      <Svg d="M9 6l6 6-6 6" className="h-3.5 w-3.5" />
    </Link>
  );
}

/** Photo tiles with a label: 2 per row beside the video, or 2 → 4 per row on their own. */
function UnitTiles({ photos, wide = false }: { photos: { image: string; label: string }[]; wide?: boolean }) {
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:gap-4 ${wide ? "lg:grid-cols-4" : ""}`}>
      {photos.map((p, i) => (
        <li key={p.image + i}>
          <Reveal index={i % 4} from="zoom">
            <figure className={`relative m-0 overflow-hidden rounded-2xl ${wide ? "aspect-[4/5]" : "aspect-square"}`}>
              <Image src={p.image} alt={p.label || "Our Kochi unit"} fill sizes="(max-width: 1024px) 46vw, 270px" className="object-cover" />
              {p.label && <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-[#174D36] px-3 py-1 text-[12.5px] font-medium text-white">{p.label}</figcaption>}
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export default async function QualityResearchPage() {
  const [accreditations, settings, unitBlock, certsBlock] = await Promise.all([
    db.page.findUnique({ where: { slug: "accreditations" }, include: { blocks: true } }),
    getSettings(),
    // Kochi unit video and photos: Admin → Pages & policies → Quality & Research
    db.pageBlock.findFirst({ where: { type: "unit", page: { slug: "quality-research" } } }),
    // certificates PDF for the download button: same admin page, "Certificates download"
    db.pageBlock.findFirst({ where: { type: "certs", page: { slug: "quality-research" } } }),
  ]);
  const certsPdf = ((certsBlock?.data ?? {}) as CertsData).pdf?.trim() || "";
  const unit = (unitBlock?.data ?? {}) as UnitData;
  const unitTitle = unitBlock?.title?.trim() || "Inside Our Kochi Unit";
  const unitPhotos = (unit.photos ?? []).filter((p) => p.image) as { image: string; label: string }[];
  const hasVideo = Boolean(parseVideo(unit.video ?? ""));
  const certImages = (accreditations?.blocks.find((b) => b.type === "gallery")?.data as GalleryData | undefined)?.images ?? [];
  const certs: Cert[] = CERT_PICKS.map(([re, label]) => ({ label, src: certImages.find((u) => re.test(u.split("/").pop() ?? "")) ?? "" })).filter((c) => c.src);

  const wa = settings.whatsappNumber.replace(/\D/g, "");
  const enquiryHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent("Hello Nupal, I would like to enquire about your testing and research services.")}`
    : settings.email
      ? `mailto:${settings.email}?subject=${encodeURIComponent("Testing and research services enquiry")}`
      : "/consult";

  return (
    <div>
      {/* 02 · Hero: the same story banner as Our Story, with a lab photo in the arch and the Ayush badge */}
      <StoryBanner
        id="qr-h"
        eyebrow="Quality & Research | Since 1960"
        lines={["Tested at Every Step.", "Trusted Since 1960."]}
        text="From the herbs we buy to the medicine you take, every batch passes through our own laboratory in Kochi."
        ctas={[
          { label: "See How We Test", href: "#how-we-test", primary: true },
          { label: "Shop Tested Formulations", href: "/shop" },
        ]}
        media={
          <Arch>
            <Image src="/quality/hptlc.webp" alt="An analyst at work in the Nupal quality control laboratory" fill priority sizes="(max-width: 1024px) 46vw, 290px" className="object-cover object-[72%_center]" />
          </Arch>
        }
        badgeIcon={
          <span aria-hidden="true" className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#174D36] text-[15px] font-semibold text-[#E7C88F] shadow-[inset_0_0_0_2px_#174D36,inset_0_0_0_4px_#E7C88F]">AY</span>
        }
        badgeTitle="Approved R&D laboratory"
        badgeSub="Ministry of Ayush, Govt. of India"
        scrollHref="#how-we-test"
      />

      {/* 03 · Proof bar + journey */}
      <section id="how-we-test" aria-labelledby="journey-h" className="scroll-mt-28 bg-[#F4EBD2] py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          <ul className="grid grid-cols-2 overflow-hidden rounded-2xl bg-[#174D36] lg:grid-cols-4">
            {PROOF.map(([n, label, plain], i) => (
              <li key={label}>
                <Reveal index={i} className="h-full">
                  <div className={`h-full px-4 py-5 text-center sm:py-7 ${i % 2 ? "border-l border-white/15" : ""} ${i > 1 ? "border-t border-white/15 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                    <p className="font-display text-[clamp(32px,4vw,46px)] font-semibold leading-none text-white"><CountUp to={n} from={plain ? 1900 : 0} plain={plain} /></p>
                    <p className="mt-2 text-[13.5px] leading-5 text-[#E7C88F]">{label}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal className="mt-14 text-center">
            <Eyebrow>Our process</Eyebrow>
            <H2 id="journey-h">From Herb to Home</H2>
            <p className="mt-3 text-[#5e6862]">Six checks between the field and your shelf.</p>
          </Reveal>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {JOURNEY.map(([t, d], i) => (
              <li key={t}>
                <Reveal index={i % 3} className="h-full">
                  <div className="flex h-full gap-4 rounded-2xl bg-white p-5 shadow-[0_10px_30px_-24px_rgba(23,77,54,.5)]">
                    <span className="font-display text-[30px] font-semibold leading-none text-[#C9A45C]">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold text-[#174D36]">{t}</span>
                      <span className="mt-1 block text-[14.5px] leading-6 text-[#5e6862]">{d}</span>
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 · Promise + tests */}
      <section aria-labelledby="promise-h" className="bg-white py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          <Reveal className="text-center">
            <Eyebrow>Our promise</Eyebrow>
            <H2 id="promise-h">Our Promise in Three Words</H2>
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {PILLARS.map(([t, d], i) => (
              <li key={t}>
                <Reveal index={i} className="h-full">
                  <div className="h-full rounded-2xl border border-[#E3E8E0] bg-[#FAF9F4] p-6 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#EAF2E7] text-[#174D36]"><Svg d={I.shield} /></span>
                    <p className="mt-4 font-display text-[26px] font-semibold text-[#174D36]">{t}</p>
                    <p className="mt-1 leading-7 text-[#5e6862]">{d}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

        </div>
      </section>

      <section aria-labelledby="tests-h" className="bg-[#F4EBD2] py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          <Reveal className="text-center">
            <H2 id="tests-h">What We Test, in Plain Words</H2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-5">
            {TESTS.map(([t, d, icon], i) => (
              <li key={t}>
                <Reveal index={i % 5} className="h-full">
                  <div className="flex h-full gap-3 rounded-2xl bg-white p-4 lg:flex-col lg:items-center lg:p-5 lg:text-center">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF2E7] text-[#174D36]"><Svg d={icon} className="h-5 w-5" /></span>
                    <span>
                      <span className="block font-semibold text-[#174D36]">{t}</span>
                      <span className="mt-1 block text-[14px] leading-6 text-[#5e6862]">{d}</span>
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center"><TextLink href="/shop">Shop tested formulations</TextLink></div>
        </div>
      </section>

      {/* 05 · Inside the lab */}
      <section aria-labelledby="lab-h" className="bg-[#FAF9F4] py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          <Reveal className="text-center">
            <Eyebrow>Our laboratory</Eyebrow>
            <H2 id="lab-h">Inside the Lab</H2>
            <p className="mt-3 text-[#5e6862]">The instruments behind every test, in plain words.</p>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {INSTRUMENTS.map(([t, d, img], i) => (
              <li key={t}>
                <Reveal index={i % 4} className="h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E3E8E0] bg-white">
                    <div className="relative aspect-[3/2] bg-[linear-gradient(160deg,#EEF2EF,#B9C4BC)]">
                      {img ? (
                        <Image src={img} alt={t} fill sizes="(max-width: 1024px) 46vw, 270px" className="object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-[#174D36]/70"><Svg d={I.flask} className="h-12 w-12" /></span>
                      )}
                    </div>
                    <div className="p-3.5 sm:p-4">
                      <p className="font-semibold leading-snug text-[#174D36]">{t}</p>
                      <p className="mt-1 text-[13.5px] leading-5 text-[#5e6862]">{d}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
            <li>
              <Reveal index={3} className="h-full">
                <Link href="/consult" className="flex h-full flex-col justify-center rounded-2xl bg-[#174D36] p-5 text-white transition-colors hover:bg-[#397C42]">
                  <p className="font-display text-[22px] font-semibold leading-tight">Questions about a medicine?</p>
                  <p className="mt-2 text-[14px] leading-6 text-white/80">Ask our Ayurvedic doctors before you buy.</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-medium text-[#E7C88F]">Consult a doctor <Svg d="M9 6l6 6-6 6" className="h-3.5 w-3.5" /></span>
                </Link>
              </Reveal>
            </li>
          </ul>
        </div>
      </section>

      {/* 06 · Our Kochi unit: a video with photo tiles beside it (Admin → Pages & policies → Quality & Research) */}
      {(hasVideo || unitPhotos.length > 0) && (
        <section aria-labelledby="unit-h" className="bg-[#F4EBD2] py-14 sm:py-20">
          <div className="container-x max-w-[1120px]">
            <Reveal className="text-center">
              <Eyebrow>Where it is made</Eyebrow>
              <H2 id="unit-h">{unitTitle}</H2>
              {unit.text && <p className="mt-3 text-[#5e6862]">{unit.text}</p>}
            </Reveal>
            {hasVideo ? (
              <div className="mt-8 grid gap-3 sm:gap-4 lg:grid-cols-[1.55fr_1fr] lg:items-start">
                <Reveal>
                  <UnitVideo url={unit.video!} poster={unit.poster ?? null} title={unit.videoTitle || unitTitle} />
                  {(unit.videoTitle || unit.videoText) && (
                    <div className="mt-4">
                      {unit.videoTitle && <p className="font-semibold text-[#174D36]">{unit.videoTitle}</p>}
                      {unit.videoText && <p className="mt-0.5 text-[14px] text-[#5e6862]">{unit.videoText}</p>}
                    </div>
                  )}
                </Reveal>
                {unitPhotos.length > 0 && <UnitTiles photos={unitPhotos.slice(0, 4)} />}
              </div>
            ) : (
              <div className="mt-8"><UnitTiles photos={unitPhotos.slice(0, 4)} wide /></div>
            )}
            {unitPhotos.length > 4 && (
              <details className="group mt-4">
                <summary className="ml-auto flex min-h-11 w-max cursor-pointer list-none items-center gap-1.5 font-medium text-[#397C42] hover:text-[#174D36] [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">View all photos</span>
                  <span className="hidden group-open:inline">Show fewer photos</span>
                  <Svg d="M6 9l6 6 6-6" className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3"><UnitTiles photos={unitPhotos.slice(4)} wide /></div>
              </details>
            )}
          </div>
        </section>
      )}

      {/* 07 · Certified and approved (mockup slide 10): certifications on the left, certificate cards on the right,
          overseas approvals and the PDF download underneath */}
      <section aria-labelledby="cert-h" className="bg-[#FAF9F4] py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          <Reveal className="text-center">
            <H2 id="cert-h">Certified and Approved</H2>
            <p className="mt-3 text-[#5e6862]">Proof you can see, with certificates you can download.</p>
          </Reveal>
          <div className="mt-9 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            <ul className="grid gap-3">
              {([
                ["GMP", "GMP certificate", "Drugs Control Administration, Government of Kerala"],
                ["WHO", "WHO-GMP certified", "Manufacturing quality to WHO guidelines"],
                ["ISO", "ISO 9001:2015", "Quality management, certified by UKCERT"],
                ["AQM", "AYUSH Quality Mark", "Granted by the Ayush Export Promotion Council (AYUSHEXCIL), supported by the Ministry of Ayush"],
                ["AY", "Approved R&D laboratory", "Approvals and certifications from the Ministry of Ayush, Govt. of India"],
              ] as const).map(([seal, t, d], i) => (
                <li key={t}>
                  <Reveal index={i}>
                    <div className="flex items-center gap-4 rounded-2xl border border-[#E3E8E0] bg-white px-4 py-4 sm:px-5">
                      <span aria-hidden="true" className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#174D36] text-[11px] font-semibold tracking-[.04em] text-white shadow-[inset_0_0_0_3px_#174D36,inset_0_0_0_4.5px_#E7C88F]">{seal}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug text-[#174D36]">{t}</span>
                        <span className="mt-0.5 block text-[13.5px] leading-5 text-[#5e6862]">{d}</span>
                      </span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
            {certs.length > 0 && (
              <Reveal index={1}>
                <CertStrip certs={certs} listClassName="grid grid-cols-3 gap-3 sm:gap-4" />
              </Reveal>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-[12px] font-semibold uppercase tracking-[.16em] text-[#397C42]">Product approvals</p>
              <ul className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                {["UAE", "Malaysia", "Mongolia", "Bahrain (NHRA)"].map((c) => (
                  <li key={c} className="flex items-center gap-1.5 rounded-full border border-[#E3E8E0] bg-white px-3.5 py-1.5 text-[14px] text-[#174D36]">
                    <span className="text-[#397C42]"><Svg d="M5 12.5l4.5 4.5L19 7.5" className="h-4 w-4" /></span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-end">
              {certsPdf && (
                <a href={certsPdf} target="_blank" rel="noopener noreferrer" download className="btn h-[52px] w-full rounded-full bg-[#174D36] px-8 text-white hover:bg-[#397C42] sm:w-auto">
                  <Svg d="M12 4v11M7 10l5 5 5-5M5 20h14" className="h-5 w-5" />
                  Download certificates (PDF)
                </a>
              )}
              <Link href="/accreditations" className="inline-flex min-h-11 items-center text-[14px] font-medium text-[#397C42] hover:text-[#174D36]">View all on the Accreditations page</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 08 · Research + services */}
      <section aria-labelledby="research-h" className="bg-[#FAF9F4] pb-14 sm:pb-20">
        <div className="container-x grid max-w-[1120px] gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full py-2 lg:pr-6">
              <Eyebrow>Research</Eyebrow>
              <H2 id="research-h">Research That Keeps Tradition Alive</H2>
              <p className="mt-3 leading-7 text-[#5e6862]">Our research and quality teams study classical formulations and test them to modern standards.</p>
              <ul className="mt-5 grid gap-2.5">
                {["Patented and proprietary medicines", "An in-house research team", "Classical formulations, tested to modern standards"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 rounded-xl border border-[#E3E8E0] bg-white px-4 py-3 text-[#22302A]">
                    <span className="mt-0.5 text-[#397C42]"><Svg d="M5 12.5l4.5 4.5L19 7.5" className="h-5 w-5" /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal index={1} className="h-full">
            <div className="flex h-full flex-col rounded-[24px] bg-[#174D36] p-6 text-white sm:p-8">
              <Eyebrow light>For businesses and partners</Eyebrow>
              <h3 className="mt-2 text-[clamp(24px,2.6vw,32px)] font-semibold leading-tight">Testing and Research Services</h3>
              <ul className="mt-5 grid gap-2.5">
                {SERVICES.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-white/90">
                    <span className="mt-0.5 text-[#E7C88F]"><Svg d="M5 12.5l4.5 4.5L19 7.5" className="h-5 w-5" /></span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <a href={enquiryHref} target={enquiryHref.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="btn h-[52px] w-full rounded-lg bg-white px-8 text-[#174D36] hover:bg-[#F4EBD2] sm:w-auto">
                  Send an enquiry
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 09 · FAQ (the batch check is left out) */}
      <section aria-labelledby="faq-h" className="bg-white py-14 sm:py-20">
        <div className="container-x max-w-[820px]">
          <Reveal className="text-center">
            <H2 id="faq-h">Questions, Answered</H2>
          </Reveal>
          <div className="mt-8 divide-y divide-[#E3E8E0] rounded-2xl border border-[#E3E8E0]">
            {FAQS.map(([q, a], i) => (
              <details key={q} open={i === 0} className="group px-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold text-[#174D36] [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden="true" className="text-xl leading-none text-[#397C42] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 leading-7 text-[#5e6862]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · Closing call to action */}
      <FinalCta title="Ayurveda You Can Trust, Tested at Every Step." text="Shop formulations tested in our own lab, or talk to an Ayurvedic doctor first." />
    </div>
  );
}
