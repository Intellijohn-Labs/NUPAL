import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import type { CardsData, DuoData, HeroData, FounderData, GalleryData, IntroData, LogosData, MessageData, PeopleData, StatsData, TextData } from "@/lib/blocks";
import { PageBlock } from "@/components/store/PageBlocks";
import { ProductCard } from "@/components/store/ProductCard";
import { CountUp } from "@/components/store/CountUp";
import { Reveal } from "@/components/store/Reveal";
import { FinalCta } from "@/components/store/FinalCta";
import { CertStrip, type Cert } from "@/components/store/CertStrip";
import localFont from "next/font/local";

// The story banner uses the team mockup's type: Lora for the headline, Poppins for the words and buttons.
const lora = localFont({
  variable: "--font-lora",
  display: "swap",
  src: [{ path: "../../../../node_modules/@fontsource/lora/files/lora-latin-700-normal.woff2", weight: "700" }],
});
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../../../../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2", weight: "400" },
    { path: "../../../../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2", weight: "500" },
    { path: "../../../../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2", weight: "600" },
  ],
});

/**
 * Our Story (the old About page), built to the team's "Our Story Page Direction" (Nov 2026, v3):
 * 01 header · 02 story banner · 03 proof bar + since 1960 · 04 teacher to student · 05 journey + vision/mission ·
 * 06 what we stand for + products · 07 quality + approvals · 08 doctors · 09 leadership · 10 partners + CSR ·
 * 11 final call · 12 footer.
 *
 * Words and photos come from the "about-us" page in Admin → Pages & policies, one block per section:
 *   Story banner → the top banner's words and buttons · Story opening → Since 1960 · Numbers → proof bar · Founder → portrait, badge and DNA line ·
 *   Milestones → Our journey (shown exactly as before) · Two cards → vision and mission ·
 *   Numbered cards → What we stand for · Text (vision & mission) → the quality section's photo ·
 *   Message → chairman (short quote + full message) · People → the team (chairman and doctors are left out) ·
 *   Logos → partners.
 * Products, doctors and certificates (Accreditations page gallery) are live.
 */

export const metadata: Metadata = {
  title: "Our Story",
  description: "Six decades of Ayurveda from Kochi. From a research centre in Kochi to formulations trusted in homes and clinics across India and overseas, made the traditional way.",
  alternates: { canonical: "/our-story" },
};


const strip = (s: string) => s.replace(/\*\*/g, "").trim();
const paras = (s = "") => s.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
/** "Dr. T. P. Sachith Roy" → "sachith roy": drops titles and initials, for matching names across sections. */
const nameKey = (s: string) =>
  s.toLowerCase().replace(/^(late\s+)?(sri\.?|shri|dr|mr|mrs|ms)\.?\s+/g, "").replace(/\b[a-z]\.\s*/g, "").replace(/[^a-z ]/g, "").trim();

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-[12px] font-semibold uppercase tracking-[.18em] ${light ? "text-[#E7C88F]" : "text-[#397C42]"}`}>{children}</p>;
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

function TextLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-1.5 border-b-2 font-medium transition-colors ${light ? "border-[#E7C88F]/60 text-[#E7C88F] hover:border-[#E7C88F]" : "border-[#84B641] text-[#174D36] hover:border-[#174D36]"}`}
    >
      {children}
      <Arrow />
    </Link>
  );
}

/** The round "V" seal used beside Vaidyavachaspathy. */
function Seal({ size = 40 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-full bg-[#174D36] font-display text-[#E7C88F] shadow-[inset_0_0_0_2px_#174D36,inset_0_0_0_4px_#E7C88F]" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      V
    </span>
  );
}

/**
 * Founder portrait in a cream arch. Until a clear photo is uploaded (Admin → Pages & policies → Our Story →
 * Founder → Portrait), a simple drawn Vaidya figure is shown, as in the team mockup.
 */
function ArchPortrait({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden="true" className="absolute -inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(255,240,205,.30)_0%,rgba(255,240,205,.10)_40%,transparent_70%)]" />
      <div className="relative aspect-[25/32] overflow-hidden rounded-[999px_999px_10px_10px] bg-[radial-gradient(85%_65%_at_50%_38%,#FFFBF1_0%,#F8EDD3_45%,#EEDDB4_100%)] shadow-[0_30px_60px_-34px_rgba(0,0,0,.6)]">
        {src ? <img src={src} alt={alt} className="h-full w-full object-cover object-top" /> : <FounderFigure label={alt} />}
      </div>
    </div>
  );
}

/** Placeholder founder: a Vaidya in a white head-wrap and white robe (mockup style). */
function FounderFigure({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 250 320" role="img" aria-label={`${label} (photo coming soon)`} className="absolute inset-x-0 bottom-0 h-auto w-full">
      <path d="M48 320V262c0-34 24-58 58-58h38c34 0 58 24 58 58v58z" fill="#FFFFFF" />
      <path d="M103 204l22 54 22-54z" fill="#E6DAC0" />
      <rect x="110" y="168" width="30" height="42" rx="6" fill="#C98A64" />
      <circle cx="125" cy="128" r="48" fill="#C98A64" />
      <path d="M77 124c0-30 21-52 48-52s48 22 48 52c-8-10-26-17-48-17s-40 7-48 17z" fill="#F4F2EC" />
      <path d="M77 124c8-10 26-17 48-17s40 7 48 17" fill="none" stroke="#D9D4C8" strokeWidth="3" />
      <path d="M80 112c10-8 26-12 45-12s35 4 45 12" fill="none" stroke="#E6E2D8" strokeWidth="2" />
      <circle cx="108" cy="134" r="4" fill="#3A2A1F" />
      <circle cx="142" cy="134" r="4" fill="#3A2A1F" />
      <path d="M112 152c8 8 18 8 26 0" fill="none" stroke="#7A3F25" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A simple line double helix (one green strand, one olive strand, sand rungs).
 * Desktop: fills its box (as wide as the box, cropped at the bottom). Phones: a fixed number of `turns`, shown whole.
 * `id` keeps each helix's colour gradient separate (a gradient inside a hidden helix would not paint).
 */
function Helix({ id, className = "", turns, stroke = 5.5 }: { id: string; className?: string; turns?: number; stroke?: number }) {
  const W = 240, A = 92, P = 330;
  // Without `turns` it is drawn very tall and cropped at the bottom, so it is exactly as wide as its box at any height.
  const H = turns ? Math.round(P * turns) : 2400;
  const pad = stroke; // keeps the round line ends inside the drawing
  const pts = (sign: number) =>
    Array.from({ length: Math.floor(H / 6) + 1 }, (_, i) => {
      const y = i * 6;
      return `${(W / 2 + sign * A * Math.sin((2 * Math.PI * y) / P)).toFixed(1)},${y}`;
    }).join(" ");
  const rungs = Array.from({ length: Math.floor(H / 34) }, (_, i) => 17 + i * 34);
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}`}
      preserveAspectRatio={turns ? "xMidYMid meet" : "xMidYMin slice"}
      aria-hidden="true"
      className={className}
      style={turns ? { aspectRatio: `${W + pad * 2} / ${H + pad * 2}` } : undefined}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7DBF5E" />
          <stop offset="1" stopColor="#5AA052" />
        </linearGradient>
      </defs>
      {rungs.map((y) => {
        const dx = A * Math.sin((2 * Math.PI * y) / P);
        return Math.abs(dx) > 12 ? <line key={y} x1={W / 2 - dx} x2={W / 2 + dx} y1={y} y2={y} stroke="#C9BC8E" strokeOpacity=".6" strokeWidth={stroke * 0.72} /> : null;
      })}
      <polyline points={pts(1)} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" />
      <polyline points={pts(-1)} fill="none" stroke="#B3AE74" strokeOpacity=".9" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

function Leaf({ className = "", fill = "#2C6A48" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 120 220" aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <path d="M60 220C8 170 4 80 60 0c56 80 52 170 0 220z" fill={fill} />
      <path d="M60 216V14" stroke="rgba(255,255,255,.22)" strokeWidth="1.6" fill="none" />
      <path d="M60 70l-18-16M60 110l-24-20M60 150l-26-22M60 90l18-16M60 130l24-20M60 170l26-22" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  person: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />,
  shield: <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3zM9 12l2 2 4-4" />,
  leaf: <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />,
  flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9" />,
  whatsapp: <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-1 0-2.3-1.3-2.3-2.3l.8-1-1-2L9 9z" />,
};
function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

// Certificates picked from the Accreditations page gallery (by file name), in the order of the design.
const CERT_PICKS: [RegExp, string][] = [
  [/(^|[^o-])gmp-certificate/i, "GMP"],
  [/who-gmp/i, "WHO-GMP"],
  [/iso-9001/i, "ISO 9001"],
  [/moh-uae|uae/i, "UAE MoH"],
  [/malaysia/i, "Malaysia"],
];

export default async function OurStoryPage() {
  const [page, accreditations, products, doctors, settings] = await Promise.all([
    db.page.findUnique({ where: { slug: "about-us" }, include: { blocks: { orderBy: { sortOrder: "asc" } } } }),
    db.page.findUnique({ where: { slug: "accreditations" }, include: { blocks: true } }),
    db.product.findMany({ where: { isActive: true }, include: cardInclude, orderBy: [{ isBestseller: "desc" }, { sortOrder: "asc" }, { name: "asc" }], take: 4 }),
    db.doctor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);

  const blocks = page?.blocks ?? [];
  const block = (type: string) => blocks.find((b) => b.type === type);
  const data = <T,>(type: string) => (block(type)?.data ?? {}) as T;

  // Story banner words (Admin → Pages & policies → Story banner); empty fields use the design's wording.
  const hero = data<HeroData>("hero");
  const heroEyebrow = hero.eyebrow?.trim() || "Our story | Since 1960";
  const heroLines = (hero.headline?.trim() || "Six Decades of\nAyurveda from Kochi.").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const heroText = hero.text?.trim() ?? "From a research centre in Kochi to formulations trusted in homes and clinics across India and overseas, made the traditional way.";
  const heroCtas = [
    { label: hero.cta1Label ?? "Shop Bestsellers", href: hero.cta1Href?.trim() || "#bestsellers", primary: true },
    { label: hero.cta2Label ?? "Book a Consultation", href: hero.cta2Href?.trim() || "/consult", primary: false },
  ].filter((c) => c.label.trim());

  const intro = data<IntroData>("intro");
  const introBlock = block("intro");
  const stats = data<StatsData>("stats").stats ?? [];
  const founder = data<FounderData>("founder");
  const timeline = block("timeline");
  const duo = data<DuoData>("duo").cards ?? [];
  const valuesBlock = block("cards");
  const values = data<CardsData>("cards").cards ?? [];
  const quality = data<TextData>("text"); // its photo is used in the quality section
  const chairman = data<MessageData>("message");
  const people = data<PeopleData>("people").people ?? [];
  const logosBlock = block("logos");
  const logos = (data<LogosData>("logos").logos ?? []).filter((l) => l.image || l.name);

  const founderImg = founder.image || intro.image || null; // null → drawn placeholder until a photo is uploaded
  const founderName = intro.name?.trim() || "Late Sri N. K. Padmanabhan Vaidyar";
  const badge = founder.badge?.trim() || "Vaidyavachaspathy";
  const badgeSub = founder.badgeSub?.trim() || "Ayurveda’s highest title";
  const dnaLine = founder.quote?.trim() || "His knowledge lives on in every NUPAL medicine, like the DNA in a family.";
  const [storyLead, ...storyMore] = paras(intro.body);

  const vision = duo[0] ?? { title: "Our Vision", text: "To make authentic Ayurveda available to everyone, joining time-tested knowledge with modern technology." };
  const mission = duo[1] ?? { title: "Our Mission", text: "To carry Ayurveda’s life-sustaining benefits to more people, through a trusted range, a research team and certified manufacturing." };

  // Team: everyone in the People block except the chairman (shown above them) and the doctors (their own section).
  const chairKey = chairman.name ? nameKey(chairman.name) : "";
  const doctorKeys = doctors.map((d) => nameKey(d.name));
  const isDoctor = (n: string) => /^dr\b/i.test(n.trim()) || doctorKeys.some((k) => k && nameKey(n).includes(k));
  const team = people.filter((p) => nameKey(p.name) !== chairKey && !isDoctor(p.name));
  const chairmanRole = people.find((p) => chairKey && nameKey(p.name) === chairKey)?.role || chairman.role || "Chairman";
  const chairQuote = chairman.quote?.trim() || strip(paras(chairman.body)[0] ?? "").split(/(?<=\.)\s/)[0];
  const doctorRole = (name: string) => people.find((p) => nameKey(p.name).includes(nameKey(name)))?.role.replace(/^\(([^)]*)\),?\s*/, "$1, ") ?? "";

  const certImages = (accreditations?.blocks.find((b) => b.type === "gallery")?.data as GalleryData | undefined)?.images ?? [];
  const certs: Cert[] = CERT_PICKS.map(([re, label]) => ({ label, src: certImages.find((u) => re.test(u.split("/").pop() ?? "")) ?? "" })).filter((c) => c.src);

  const waDigits = settings.whatsappNumber.replace(/\D/g, "");
  const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent("Hello NUPAL, I would like some guidance from your Ayurvedic doctors.")}` : "/consult";

  return (
    <div className="relative">
      {/* 02 · Story banner (team mockup, slide 06): full first screen in forest green. Text on the left, a line
          double helix down the middle, the founder in a cream arch on the right with the Vaidyavachaspathy badge. */}
      <section aria-labelledby="story-h" className={`${lora.variable} ${poppins.variable} relative overflow-hidden bg-[#174D36] text-white`}>
        {/* soft light behind the portrait, with faint rings */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_76%_46%,#2A6C4C_0%,#1F5B40_32%,#174D36_62%,#13442F_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[34%] aspect-square w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[repeating-radial-gradient(circle,rgba(255,255,255,.035)_0_70px,transparent_70px_140px)] lg:left-[76%] lg:top-1/2 lg:w-[70vw]" />
        {/* desktop: the helix has its own column between the words and the portrait (same grid as the content), so the headline never runs into it */}
        <div aria-hidden="true" className="container-x pointer-events-none absolute inset-0 hidden lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(120px,10vw,150px)_minmax(0,.62fr)] lg:gap-6 xl:px-16">
          <div />
          <div className="relative">
            <Helix id="hx-desk" className="absolute inset-0 h-full w-full opacity-80" />
          </div>
        </div>
        {/* phones: the helix fully visible down the left, beside the portrait (slide 15) */}
        <Helix id="hx-phone" turns={2.2} stroke={10} className="pointer-events-none absolute left-2.5 top-4 h-auto w-[min(21vw,84px)] lg:hidden" />
        <Leaf className="-bottom-16 -left-10 w-28 rotate-[18deg] sm:w-36 lg:w-44" fill="#2B6E46" />
        <Leaf className="-bottom-20 left-[44%] hidden w-28 -rotate-[24deg] lg:block" fill="#2B6E46" />
        <Leaf className="-bottom-16 -right-10 w-28 -rotate-[14deg] sm:w-36 lg:w-44" fill="#2B6E46" />

        <div className="container-x relative grid min-h-[calc(100svh-100px-64px)] content-center gap-10 pb-16 pt-7 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[minmax(0,1fr)_clamp(120px,10vw,150px)_minmax(0,.62fr)] lg:gap-6 lg:py-16 xl:px-16">
          {/* founder: right on desktop, on top on phones */}
          <div className="relative mx-auto w-[min(46vw,200px,27svh)] lg:col-start-3 lg:row-start-1 lg:w-[min(20vw,290px)]">
            <Reveal from="zoom">
              <ArchPortrait src={founderImg} alt={`${founderName}, founder of NUPAL`} />
            </Reveal>
            <div className="absolute -bottom-6 left-1/2 flex w-[calc(100%+64px)] max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-left font-[family-name:var(--font-poppins)] text-[#174D36] shadow-[0_20px_40px_-20px_rgba(0,0,0,.55)] lg:-bottom-8 lg:w-[calc(100%+110px)] lg:py-2.5 lg:pl-2.5">
              <Seal size={38} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold leading-tight lg:text-[15px]">{badge}</span>
                <span className="block truncate text-[11.5px] leading-tight text-[#6b746e] lg:text-[12px]">{badgeSub}</span>
              </span>
            </div>
          </div>

          {/* words */}
          <div className="text-center font-[family-name:var(--font-poppins)] lg:col-start-1 lg:row-start-1 lg:text-left">
            <Reveal>
              {heroEyebrow && <p className="whitespace-pre-wrap text-[12px] font-medium uppercase tracking-[.08em] text-[#E7C88F] lg:text-[13px]">{heroEyebrow.replace(/\s*\|\s*/g, "  |  ")}</p>}
              <h1 id="story-h" className="mt-3 font-[family-name:var(--font-lora)] text-[clamp(32px,4.2vw,54px)] font-bold leading-[1.18] text-white [text-wrap:wrap] lg:mt-5">
                {heroLines.map((l, i) => (
                  <span key={i} className={`block ${i === heroLines.length - 1 && heroLines.length > 1 ? "text-[#F4EBD2]" : ""} min-[400px]:whitespace-nowrap`}>{l}</span>
                ))}
              </h1>
              {heroText && <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-[1.65] text-white/90 sm:text-[16px] lg:mx-0 lg:mt-5 lg:text-[17px]">{heroText}</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:mt-8 lg:justify-start">
                {heroCtas.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    className={
                      c.primary
                        ? "inline-flex h-[52px] items-center justify-center rounded-[5px] bg-[#F4EBD2] px-7 text-[15px] font-medium text-[#174D36] shadow-[0_8px_20px_-12px_rgba(0,0,0,.6)] transition-colors hover:bg-white lg:h-14 lg:px-8 lg:text-base"
                        : "inline-flex h-[52px] items-center justify-center rounded-[5px] border-[1.5px] border-white/85 px-8 text-[15px] font-medium text-white transition-colors hover:bg-white/10 lg:h-14 lg:px-9 lg:text-base"
                    }
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <a href="#since-1960" className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center font-[family-name:var(--font-poppins)] text-[10px] tracking-[.06em] text-white/85 hover:text-white">
          SCROLL
          <svg viewBox="0 0 20 12" className="scroll-bob h-3 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 3l6 6 6-6" /></svg>
        </a>
      </section>

      {/* 03 · Proof bar + Since 1960 */}
      <section id="since-1960" aria-labelledby="since-h" className="scroll-mt-28 bg-[#F4EBD2] py-12 sm:py-16 lg:py-20">
        <div className="container-x">
          {stats.length > 0 && (
            <ul className={`grid grid-cols-2 gap-3 lg:gap-0 lg:rounded-2xl lg:bg-[#174D36] lg:py-8 lg:shadow-[0_24px_48px_-32px_rgba(23,77,54,.7)] ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {stats.map((s, i) => (
                <li key={i} className="rounded-xl bg-[#174D36] px-3 py-5 text-center text-white lg:rounded-none lg:bg-transparent lg:py-1 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-white/15">
                  <Reveal index={i} from="zoom">
                    <p className="font-display text-[clamp(30px,3.6vw,48px)] leading-none">
                      <CountUp to={s.value} />
                      {s.suffix}
                    </p>
                    <p className="mt-2 text-[13px] text-white/75 sm:text-sm">{s.label}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
            <Reveal from="left" className="relative mx-auto hidden w-full max-w-[360px] lg:block">
              <div aria-hidden="true" className="absolute -left-16 top-0 h-full w-24 bg-contain bg-center bg-no-repeat opacity-25" style={{ backgroundImage: "url(/brand/dna-helix.png)" }} />
              <ArchPortrait src={founderImg} alt={founderName} />
              <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white px-5 py-3 shadow-[0_18px_36px_-20px_rgba(23,77,54,.55)]">
                <p className="font-semibold text-[#174D36]">{intro.role?.trim() ? `${intro.role.trim()}, NUPAL` : "Founder, NUPAL"}</p>
                <p className="text-[13px] text-[#5e6862]">{founderName}</p>
              </div>
            </Reveal>

            <Reveal from="right">
              <Eyebrow>{intro.eyebrow?.trim() || "Our story"}</Eyebrow>
              <h2 id="since-h" className="mt-2 text-[clamp(38px,5vw,64px)] font-semibold leading-none text-[#174D36]">{introBlock?.title || "Since 1960"}</h2>
              {storyLead && <div className="prose-nupal mt-5 max-w-[600px] text-[16.5px] leading-8 text-[#343B35]"><ReactMarkdown>{storyLead}</ReactMarkdown></div>}
              {storyMore.length > 0 && (
                <details className="group mt-2 max-w-[600px]">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-medium text-[#174D36] [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Read more</span>
                    <span className="hidden group-open:inline">Read less</span>
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6l5 5 5-5" /></svg>
                  </summary>
                  <div className="prose-nupal mt-2 text-[16px] leading-8 text-[#343B35]"><ReactMarkdown>{storyMore.join("\n\n")}</ReactMarkdown></div>
                </details>
              )}
              <p className="mt-6 max-w-[600px] font-display text-[clamp(20px,2.1vw,25px)] italic leading-snug text-[#174D36]">{dnaLine}</p>
              {founder.body?.trim() && (
                <div className="mt-7 flex max-w-[600px] items-center gap-4 rounded-2xl bg-[#E6EFE1] px-5 py-4">
                  <Seal size={46} />
                  <div className="prose-nupal text-[15px] leading-6 text-[#174D36] [&_p]:m-0"><ReactMarkdown>{founder.body}</ReactMarkdown></div>
                </div>
              )}
              <div className="mt-6">
                <TextLink href="/shop">Explore our formulations</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 04 · From teacher to student. Desktop: green panel + artwork with the DNA line (slide 08).
          Phones: just the artwork, rounded, closing the story section (slide 15). */}
      <section aria-label="From teacher to student" className="-mt-4 bg-[#F4EBD2] pb-12 sm:pb-16 lg:mt-0 lg:pb-20">
        <div className="container-x">
          <div className="grid overflow-hidden rounded-[18px] shadow-[0_24px_48px_-34px_rgba(23,77,54,.7)] lg:grid-cols-[.72fr_1.28fr] lg:rounded-[28px] lg:bg-[#174D36]">
            <div className="relative hidden overflow-hidden px-10 py-14 text-white lg:block">
              <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-0 h-full w-28 bg-contain bg-center bg-no-repeat opacity-[.14]" style={{ backgroundImage: "url(/brand/dna-helix.png)" }} />
              <Reveal className="relative">
                <Eyebrow light>From teacher to student</Eyebrow>
                <h2 id="teach-h" className="mt-3 text-[clamp(28px,3vw,40px)] font-semibold leading-tight text-white">Knowledge handed down, generation to generation.</h2>
                <p className="mt-4 max-w-[420px] leading-7 text-white/85">
                  Ayurveda has always travelled from teacher to student. NUPAL carries that tradition forward in every medicine we make.
                </p>
                <div className="mt-6">
                  <TextLink href="#our-journey" light>Read our journey</TextLink>
                </div>
              </Reveal>
            </div>
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[340px]">
              <img src="/brand/vaidya-teaching.webp" alt="Artwork: an Ayurvedic Vaidya teaching his students among the herbs" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <Reveal from="right" className="absolute right-6 top-6 hidden max-w-[320px] lg:block">
                <p className="rounded-2xl bg-white/95 px-5 py-3.5 font-display text-[17px] italic leading-snug text-[#174D36] shadow-[0_18px_36px_-22px_rgba(0,0,0,.5)]">{dnaLine}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 05 · Our journey (unchanged component) + vision and mission */}
      <section aria-label="Our journey, vision and mission" className="bg-[#FAF9F4] py-14 sm:py-20">
        {timeline && (
          <div id={timeline.anchor || "our-journey"} className="container-x max-w-[1120px] scroll-mt-28">
            <PageBlock b={{ id: timeline.id, type: timeline.type, title: timeline.title, anchor: timeline.anchor, data: timeline.data }} />
          </div>
        )}
        <div className="container-x mt-14 grid max-w-[1120px] gap-5 sm:mt-20 md:grid-cols-2">
          {[
            { ...vision, bg: "#EAF2E7", icon: "leaf" as const },
            { ...mission, bg: "#F4EBD2", icon: "flask" as const },
          ].map((c, i) => (
            <Reveal key={i} from={i ? "right" : "left"} className="h-full">
              <div className="flex h-full gap-5 rounded-[24px] p-6 sm:p-8" style={{ background: c.bg }}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#174D36] shadow-sm"><Icon name={c.icon} className="h-6 w-6" /></span>
                <div>
                  <h3 className="text-[clamp(22px,2.2vw,28px)] font-semibold leading-tight text-[#174D36]">{c.title}</h3>
                  <p className="mt-2 leading-7 text-[#343B35]">{c.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 06 · What we stand for + products */}
      {values.length > 0 && (
        <section aria-labelledby="values-h" className="bg-white py-14 sm:py-20">
          <div className="container-x">
            <Reveal className="text-center">
              <h2 id="values-h" className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight text-[#174D36]">{valuesBlock?.title || "What We Stand For"}</h2>
            </Reveal>
            <ul className={`mt-9 grid gap-4 sm:grid-cols-2 ${values.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {values.map((v, i) => (
                <li key={i}>
                  <Reveal index={i} className="h-full">
                    <div className="h-full rounded-[20px] bg-[#F7F1E3] p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_22px_40px_-28px_rgba(23,77,54,.5)]">
                      <p className="font-display text-[34px] leading-none text-[#D9B979]">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-5 text-lg font-semibold leading-snug text-[#174D36]">{v.title}</h3>
                      {v.text && <p className="mt-2 text-[15px] leading-6 text-[#5e6862]">{v.text}</p>}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {products.length > 0 && (
        <section id="bestsellers" aria-labelledby="made-h" className="scroll-mt-28 bg-[#F4EBD2] py-14 sm:py-20">
          <div className="container-x">
            <Reveal className="text-center">
              <h2 id="made-h" className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight text-[#174D36]">Made by Nupal, Trusted by Families</h2>
              <p className="mt-2 text-[#5e6862]">A few of our most-loved formulations.</p>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
              {products.map((p, i) => (
                <Reveal key={p.id} index={i} className="h-full">
                  <ProductCard p={toCard(p)} />
                </Reveal>
              ))}
            </div>
            <div className="mt-7 text-center">
              <TextLink href="/shop">View All Products</TextLink>
            </div>
          </div>
        </section>
      )}

      {/* 07 · Quality and approvals */}
      <section aria-labelledby="quality-h" className="bg-[#FAF9F4] py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          <Reveal className="text-center">
            <h2 id="quality-h" className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight text-[#174D36]">Made to Strict Standards</h2>
            <p className="mx-auto mt-2 max-w-[620px] text-[#5e6862]">Every Nupal product is made at our own unit in Kadavanthra, Kochi.</p>
          </Reveal>
          <div className="mt-9 grid items-stretch gap-5 lg:grid-cols-2 lg:gap-8">
            {quality.image && (
              <Reveal from="left" className="h-full">
                <div className="relative h-full min-h-[220px] overflow-hidden rounded-[22px] shadow-[0_24px_48px_-32px_rgba(23,77,54,.6)]">
                  <img src={quality.image} alt="Herbs being prepared the traditional way" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </Reveal>
            )}
            <ul className={`grid gap-3 ${quality.image ? "" : "lg:col-span-2 lg:grid-cols-3"}`}>
              {[
                ["GMP", "GMP certificate", "Drugs Control Administration, Government of Kerala"],
                ["WHO", "WHO-GMP certified", "Manufacturing quality to WHO guidelines"],
                ["ISO", "ISO 9001:2015", "Quality management, certified by UKCERT"],
              ].map(([seal, title, text], i) => (
                <li key={seal}>
                  <Reveal index={i} from="right" className="h-full">
                    <div className="flex h-full items-center gap-4 rounded-[18px] border border-[#E3DCCD] bg-white px-5 py-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#174D36] text-[12px] font-bold tracking-wide text-white shadow-[inset_0_0_0_3px_#174D36,inset_0_0_0_5px_#E7C88F]">{seal}</span>
                      <div>
                        <p className="text-lg font-semibold leading-snug text-[#174D36]">{title}</p>
                        <p className="text-[14.5px] leading-6 text-[#5e6862]">{text}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-9">
            <p className="text-[12px] font-semibold uppercase tracking-[.16em] text-[#397C42]">Product approvals</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {["UAE", "Malaysia", "Mongolia", "Bahrain (NHRA)"].map((c) => (
                <li key={c} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#E3DCCD] bg-white px-4 text-[14.5px] text-[#174D36]">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#397C42]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-7 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <CertStrip certs={certs} />
            <TextLink href="/accreditations">View all accreditations</TextLink>
          </div>
        </div>
      </section>

      {/* 08 · Doctors and consultation */}
      {doctors.length > 0 && (
        <section aria-labelledby="docs-h" className="relative overflow-hidden bg-[#EAF2E7] py-14 sm:py-20">
          <Leaf className="-bottom-10 -left-6 w-20 -rotate-12 opacity-80 sm:w-24" fill="#3E8A47" />
          <div className="container-x relative grid max-w-[1120px] gap-8 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-6">
            <Reveal className="text-center lg:text-left">
              <Eyebrow>Personalised Ayurvedic guidance</Eyebrow>
              <h2 id="docs-h" className="mt-2 text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight text-[#174D36]">Talk to the Doctors Behind the Formulations</h2>
              <p className="mx-auto mt-4 max-w-[480px] leading-7 text-[#5e6862] lg:mx-0">Our in-house Ayurvedic physicians help you choose the right formulation for your health concern.</p>
            </Reveal>

            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
              {doctors.slice(0, 2).map((d, i) => (
                <li key={d.id}>
                  <Reveal index={i} from="zoom" className="h-full">
                    <div className="flex h-full flex-col rounded-[22px] bg-white p-2.5 text-center shadow-[0_20px_40px_-30px_rgba(23,77,54,.6)] sm:p-3">
                      <div className="aspect-[4/5] overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#F2F6EF,#DCE8D6)]">
                        {d.photo ? (
                          <img src={d.photo} alt={d.name} loading="lazy" className="h-full w-full object-cover object-top" />
                        ) : (
                          <span className="grid h-full place-items-center font-display text-4xl text-[#174D36]">{d.name.replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                        )}
                      </div>
                      <p className="mt-3 font-semibold leading-snug text-[#174D36]">{d.name}</p>
                      <p className="text-[13px] text-[#5e6862]">{doctorRole(d.name) || [d.qualifications, d.experience].filter(Boolean).join(", ")}</p>
                      <div className="mt-auto pt-1">
                        <Link href="/consult" className="inline-flex min-h-11 items-center gap-1 text-[13.5px] font-medium text-[#397C42] hover:text-[#174D36]">
                          Book a consultation <Arrow />
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal className="lg:col-start-1">
              <ul className="grid gap-2.5">
                {([
                  ["person", "Guidance from qualified Ayurvedic physicians"],
                  ["shield", "Video call, phone call or in-clinic consultation"],
                  ["shield", "Medicines dispatched to your door"],
                ] as const).map(([icon, text]) => (
                  <li key={text} className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-[15px] text-[#174D36]">
                    <span className="text-[#397C42]"><Icon name={icon} /></span>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/consult" className="btn h-[52px] rounded-lg bg-[#174D36] px-8 text-white hover:bg-[#397C42]">Book a Consultation</Link>
                <a href={waHref} target={waDigits ? "_blank" : undefined} rel="noopener noreferrer" className="btn h-[52px] rounded-lg border-[1.5px] border-[#174D36] bg-white/40 px-8 text-[#174D36] hover:bg-white">
                  <Icon name="whatsapp" className="h-5 w-5" /> WhatsApp Support
                  {waDigits && <span className="sr-only"> (opens WhatsApp)</span>}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 09 · Leadership */}
      {(chairman.name || team.length > 0) && (
        <section aria-labelledby="people-h" className="bg-[#F4EBD2] py-14 sm:py-20">
          <div className="container-x max-w-[1120px]">
            <Reveal className="text-center">
              <h2 id="people-h" className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight text-[#174D36]">The People Behind Nupal</h2>
            </Reveal>

            {chairman.name && (
              <Reveal className="mt-9">
                <figure className="m-0 grid items-center gap-6 rounded-[24px] bg-white p-5 shadow-[0_24px_48px_-36px_rgba(23,77,54,.6)] sm:grid-cols-[180px_1fr] sm:gap-9 sm:p-7">
                  <div className="mx-auto aspect-square w-36 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#F2F6EF,#DCE8D6)] sm:w-full">
                    {chairman.photo ? <img src={chairman.photo} alt={chairman.name} loading="lazy" className="h-full w-full object-cover object-top" /> : null}
                  </div>
                  <div className="text-center sm:text-left">
                    <Eyebrow>Chairman’s message</Eyebrow>
                    {chairQuote && <blockquote className="m-0 mt-3 font-display text-[clamp(19px,2vw,25px)] italic leading-snug text-[#174D36]">“{chairQuote.replace(/^[“"]|[”"]$/g, "")}”</blockquote>}
                    <figcaption className="mt-4">
                      <span className="block font-semibold text-[#174D36]">{chairman.name}</span>
                      <span className="text-[14px] text-[#5e6862]">{chairmanRole.replace(/\bMD\b/, "Managing Director").replace(/^CHAIRMAN/, "Chairman")}</span>
                    </figcaption>
                    {chairman.body?.trim() && (
                      <details className="group mt-2 text-left">
                        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-medium text-[#397C42] [&::-webkit-details-marker]:hidden">
                          <span className="group-open:hidden">Read the full message</span>
                          <span className="hidden group-open:inline">Show less</span>
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6l5 5 5-5" /></svg>
                        </summary>
                        <div className="prose-nupal mt-2 text-[15.5px] leading-7 text-[#343B35]"><ReactMarkdown>{chairman.body}</ReactMarkdown></div>
                      </details>
                    )}
                  </div>
                </figure>
              </Reveal>
            )}

            {team.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
                {team.map((p, i) => (
                  <li key={p.name + i}>
                    <Reveal index={i % 4} className="h-full">
                      <div className="flex h-full flex-col items-center rounded-[20px] bg-white px-4 py-6 text-center">
                        <span className="block h-24 w-24 overflow-hidden rounded-full bg-[linear-gradient(180deg,#F2F6EF,#DCE8D6)]">
                          {p.photo ? (
                            <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover object-top" />
                          ) : (
                            <span className="grid h-full place-items-center font-display text-3xl text-[#174D36]">{nameKey(p.name).split(" ").filter(Boolean).map((w, k, a) => (k === 0 || k === a.length - 1 ? w[0] : "")).join("").toUpperCase()}</span>
                          )}
                        </span>
                        <p className="mt-3 font-semibold leading-snug text-[#174D36]">{p.name}</p>
                        {p.role && <p className="mt-0.5 text-[13px] text-[#397C42]">{p.role}</p>}
                        {p.focus && <p className="mt-2 text-[13.5px] leading-5 text-[#5e6862]">{p.focus}</p>}
                        {p.bio && (
                          <details className="group mt-auto w-full pt-2 text-left">
                            <summary className="mx-auto flex min-h-11 w-max cursor-pointer list-none items-center gap-1 text-[13.5px] font-medium text-[#397C42] [&::-webkit-details-marker]:hidden">
                              <span className="group-open:hidden">Read more</span>
                              <span className="hidden group-open:inline">Show less</span>
                              <Arrow />
                            </summary>
                            <p className="mt-1 whitespace-pre-line text-[14px] leading-6 text-[#343B35]">{p.bio}</p>
                          </details>
                        )}
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* 10 · Partners + giving back */}
      <section aria-labelledby="partners-h" className="bg-[#FAF9F4] py-14 sm:py-20">
        <div className="container-x max-w-[1120px]">
          {logos.length > 0 && (
            <>
              <Reveal className="text-center">
                <h2 id="partners-h" className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight text-[#174D36]">{logosBlock?.title || "Our Associates and Partners"}</h2>
                <p className="mt-2 text-[#5e6862]">Trusted by distributors and partners in India and overseas.</p>
              </Reveal>
              <ul className="mt-8 flex flex-wrap justify-center gap-3">
                {logos.map((l, i) => {
                  const inner = (
                    <span className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border border-[#E3DCCD] bg-white p-3 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#84B641]">
                      {l.image && <img src={l.image} alt={l.name || "Partner logo"} loading="lazy" className="max-h-12 w-full object-contain" />}
                      {l.name && <span className="text-[12.5px] leading-tight text-[#5e6862]">{l.name}</span>}
                    </span>
                  );
                  return (
                    <li key={(l.image ?? l.name) + i} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(16.666%-10px)]">
                      <Reveal index={i % 6} from="zoom">
                        {l.url ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="block">{inner}<span className="sr-only"> (opens in a new tab)</span></a> : inner}
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <Reveal className={logos.length ? "mt-8" : ""}>
            <div className="flex flex-col items-start gap-4 rounded-[22px] bg-[#EAF2E7] px-6 py-6 sm:flex-row sm:items-center sm:px-8">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-[#174D36] shadow-sm"><Icon name="leaf" className="h-6 w-6" /></span>
              <div className="flex-1">
                <h3 className="text-[22px] font-semibold leading-tight text-[#174D36]">Giving Back</h3>
                <p className="mt-1 text-[#5e6862]">Read about the community work Nupal supports.</p>
              </div>
              <TextLink href="/csr">Read our CSR story</TextLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11 · Final call to action (same as the homepage) */}
      <FinalCta />
    </div>
  );
}
