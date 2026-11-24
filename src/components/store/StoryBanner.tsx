import Link from "next/link";
import localFont from "next/font/local";
import { Reveal } from "./Reveal";

// The banner uses the team mockup's type: Lora for the headline, Poppins for the words and buttons.
const lora = localFont({
  variable: "--font-lora",
  display: "swap",
  src: [{ path: "../../../node_modules/@fontsource/lora/files/lora-latin-700-normal.woff2", weight: "700" }],
});
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../../../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2", weight: "400" },
    { path: "../../../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2", weight: "500" },
    { path: "../../../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2", weight: "600" },
  ],
});

export function Leaf({ className = "", fill = "#2C6A48" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 120 220" aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <path d="M60 220C8 170 4 80 60 0c56 80 52 170 0 220z" fill={fill} />
      <path d="M60 216V14" stroke="rgba(255,255,255,.22)" strokeWidth="1.6" fill="none" />
      <path d="M60 70l-18-16M60 110l-24-20M60 150l-26-22M60 90l18-16M60 130l24-20M60 170l26-22" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" fill="none" />
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

/** Picture in a cream arch with a soft glow behind it (the banner's right-hand side). */
export function Arch({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden="true" className="absolute -inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(255,240,205,.30)_0%,rgba(255,240,205,.10)_40%,transparent_70%)]" />
      <div className="relative aspect-[25/32] overflow-hidden rounded-[999px_999px_10px_10px] bg-[radial-gradient(85%_65%_at_50%_38%,#FFFBF1_0%,#F8EDD3_45%,#EEDDB4_100%)] shadow-[0_30px_60px_-34px_rgba(0,0,0,.6)]">
        {children}
      </div>
    </div>
  );
}

export type BannerCta = { label: string; href: string; primary?: boolean };

/**
 * Story banner (team mockup, Our Story slide 06), shared by Our Story and Quality & Research:
 * full first screen in forest green, words on the left, a line double helix down the middle, a picture in a
 * cream arch on the right with a white badge under it. Phones: picture on top, helix down the left, words below.
 */
export function StoryBanner({
  id,
  eyebrow,
  lines,
  text,
  ctas,
  media,
  badgeIcon,
  badgeTitle,
  badgeSub,
  scrollHref,
}: {
  id: string;
  eyebrow?: string;
  lines: string[];
  text?: string;
  ctas: BannerCta[];
  media: React.ReactNode;
  badgeIcon: React.ReactNode;
  badgeTitle: string;
  badgeSub: string;
  scrollHref: string;
}) {
  return (
    <section aria-labelledby={id} className={`${lora.variable} ${poppins.variable} relative overflow-hidden bg-[#174D36] text-white`}>
      {/* soft light behind the picture, with faint rings */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_76%_46%,#2A6C4C_0%,#1F5B40_32%,#174D36_62%,#13442F_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[34%] aspect-square w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[repeating-radial-gradient(circle,rgba(255,255,255,.035)_0_70px,transparent_70px_140px)] lg:left-[76%] lg:top-1/2 lg:w-[70vw]" />
      {/* desktop: the helix has its own column between the words and the picture (same grid as the content), so the headline never runs into it */}
      <div aria-hidden="true" className="container-x pointer-events-none absolute inset-0 hidden lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(120px,10vw,150px)_minmax(0,.62fr)] lg:gap-6 xl:px-16">
        <div />
        <div className="relative">
          <Helix id={`${id}-hx-desk`} className="absolute inset-0 h-full w-full opacity-80" />
        </div>
      </div>
      {/* phones: the helix fully visible down the left, beside the picture */}
      <Helix id={`${id}-hx-phone`} turns={2.2} stroke={10} className="pointer-events-none absolute left-2.5 top-4 h-auto w-[min(21vw,84px)] lg:hidden" />
      <Leaf className="-bottom-16 -left-10 w-28 rotate-[18deg] sm:w-36 lg:w-44" fill="#2B6E46" />
      <Leaf className="-bottom-20 left-[44%] hidden w-28 -rotate-[24deg] lg:block" fill="#2B6E46" />
      <Leaf className="-bottom-16 -right-10 w-28 -rotate-[14deg] sm:w-36 lg:w-44" fill="#2B6E46" />

      <div className="container-x relative grid min-h-[calc(100svh-100px-64px)] content-center gap-10 pb-16 pt-7 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[minmax(0,1fr)_clamp(120px,10vw,150px)_minmax(0,.62fr)] lg:gap-6 lg:py-16 xl:px-16">
        {/* picture: right on desktop, on top on phones */}
        <div className="relative mx-auto w-[min(46vw,200px,27svh)] lg:col-start-3 lg:row-start-1 lg:w-[min(20vw,290px)]">
          <Reveal from="zoom">{media}</Reveal>
          <div className="absolute -bottom-6 left-1/2 flex w-max min-w-[calc(100%+64px)] max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-left font-[family-name:var(--font-poppins)] text-[#174D36] shadow-[0_20px_40px_-20px_rgba(0,0,0,.55)] lg:-bottom-8 lg:min-w-[calc(100%+110px)] lg:py-2.5 lg:pl-2.5">
            {badgeIcon}
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold leading-tight lg:text-[15px]">{badgeTitle}</span>
              <span className="block truncate text-[11.5px] leading-tight text-[#6b746e] lg:text-[12px]">{badgeSub}</span>
            </span>
          </div>
        </div>

        {/* words */}
        <div className="text-center font-[family-name:var(--font-poppins)] lg:col-start-1 lg:row-start-1 lg:text-left">
          <Reveal>
            {eyebrow && <p className="whitespace-pre-wrap text-[12px] font-medium uppercase tracking-[.08em] text-[#E7C88F] lg:text-[13px]">{eyebrow.replace(/\s*\|\s*/g, "  |  ")}</p>}
            <h1 id={id} className="mt-3 font-[family-name:var(--font-lora)] text-[clamp(32px,4.2vw,54px)] font-bold leading-[1.18] text-white [text-wrap:wrap] lg:mt-5">
              {lines.map((l, i) => (
                <span key={i} className={`block ${i === lines.length - 1 && lines.length > 1 ? "text-[#F4EBD2]" : ""} min-[400px]:whitespace-nowrap`}>{l}</span>
              ))}
            </h1>
            {text && <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-[1.65] text-white/90 sm:text-[16px] lg:mx-0 lg:mt-5 lg:text-[17px]">{text}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:mt-8 lg:justify-start">
              {ctas.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  className={
                    c.primary
                      ? "inline-flex h-[52px] items-center justify-center whitespace-nowrap rounded-[5px] bg-[#F4EBD2] px-7 text-[15px] font-medium text-[#174D36] shadow-[0_8px_20px_-12px_rgba(0,0,0,.6)] transition-colors hover:bg-white lg:h-14 lg:px-6 lg:text-base xl:px-8"
                      : "inline-flex h-[52px] items-center justify-center whitespace-nowrap rounded-[5px] border-[1.5px] border-white/85 px-8 text-[15px] font-medium text-white transition-colors hover:bg-white/10 lg:h-14 lg:px-6 lg:text-base xl:px-9"
                  }
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <a href={scrollHref} className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center font-[family-name:var(--font-poppins)] text-[10px] tracking-[.06em] text-white/85 hover:text-white">
        SCROLL
        <svg viewBox="0 0 20 12" className="scroll-bob h-3 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 3l6 6 6-6" /></svg>
      </a>
    </section>
  );
}
