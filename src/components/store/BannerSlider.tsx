"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductArt } from "./ProductArt";

export type BannerData = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageDesktop: string | null;
  imageMobile: string | null;
  theme: string;
};

export type HeroProduct = { name: string; type: string; image: string | null };

/**
 * Hero banner, following the team's homepage direction (section 02):
 * full first screen, writing directly on a warm artwork, packs on a podium with a few herbs,
 * one big Shop Now button, Book a Consultation, three trust chips and a Scroll cue.
 * Phones: artwork in the top half, centred writing and full-width buttons below.
 *
 * Background per banner (admin → Banners → Background colour):
 * green = warm sand (the team's design, default), cream = ivory, brown = pale green.
 */
const BACKGROUNDS: Record<string, string> = {
  green: "linear-gradient(180deg,#F6E9CC 0%,#F1DDB3 55%,#EBCF9C 100%)",
  cream: "linear-gradient(180deg,#FCF8EC 0%,#F4EBD2 100%)",
  brown: "linear-gradient(180deg,#EEF5EA 0%,#DCEBD5 100%)",
};

/** Phones: colour of the text panel under a banner photo (same "Background colour" setting). */
const PANELS: Record<string, string> = {
  green: "#143F2C", // forest green
  cream: "#3B2616", // dark wood brown
  brown: "#4A1012", // deep maroon
};


/** Old animated stage: DNA gently swaying behind floating packs, leaves and two floating chips. */
const STAGE: Record<string, { disc: string; inner: string; leaf: [string, string, string] }> = {
  green: { disc: "radial-gradient(circle at 50% 45%, #FBF3E1, #F3E2BE 60%, transparent 61%)", inner: "#E9D3A6", leaf: ["#3E7348", "#4F8A5B", "#2F6B45"] },
  cream: { disc: "radial-gradient(circle at 50% 45%, #FFFFFF, #F4EBD2 60%, transparent 61%)", inner: "#EADFC2", leaf: ["#3E7348", "#72BF44", "#567459"] },
  brown: { disc: "radial-gradient(circle at 50% 45%, #F7FBF4, #DCEBD5 60%, transparent 61%)", inner: "#C9DDBF", leaf: ["#3E7348", "#4F8A5B", "#2F6B45"] },
};

function StageProduct({ p, className, size }: { p: HeroProduct | undefined; className: string; size: number }) {
  if (!p) return null;
  return (
    <div className={className}>
      {p.image ? (
        <div className="relative aspect-[3/4] w-full">
          <Image src={p.image} alt="" fill sizes="240px" className="object-contain" style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,.25))" }} />
        </div>
      ) : (
        <div className="[&>svg]:h-auto [&>svg]:w-full">
          <ProductArt name={p.name} type={p.type} size={size} />
        </div>
      )}
    </div>
  );
}

function Stage({ products, theme }: { products: HeroProduct[]; theme: string }) {
  const t = STAGE[theme] ?? STAGE.green;
  const [main, left, right] = products;
  return (
    <div aria-hidden="true" className="hero-in relative mx-auto aspect-square w-full max-w-[240px] sm:max-w-[320px] md:max-w-[480px]" style={{ animationDelay: ".15s" }}>
      <div className="absolute inset-0 rounded-full border border-dashed border-[#C9A45C]/60" />
      <div className="absolute inset-[6%] rounded-full" style={{ background: t.disc }} />
      <div className="absolute inset-[8%] rounded-full opacity-40" style={{ background: t.inner }} />
      {/* NUPAL’s DNA illustration, gently swaying behind the products */}
      <div className="dna-spin absolute -inset-x-[6%] -inset-y-[4%] bg-contain bg-center bg-no-repeat opacity-30" style={{ backgroundImage: "url(/brand/dna-helix.png)" }} />
      <svg viewBox="0 0 400 400" className="hero-sway absolute inset-0">
        <path d="M40 330c20-90 100-140 190-120-35 80-110 125-190 120z" fill={t.leaf[0]} />
        <path d="M370 320c-30-80-100-120-180-100 40 70 110 110 180 100z" fill={t.leaf[1]} />
        <path d="M60 120c40-60 120-70 170-30-40 45-120 60-170 30z" fill={t.leaf[2]} opacity=".8" />
      </svg>
      {left && <StageProduct p={left} size={92} className="absolute bottom-[16%] left-[10%] w-[24%]" />}
      {right && <StageProduct p={right} size={92} className="absolute bottom-[16%] right-[8%] w-[24%]" />}
      <div className={`absolute left-1/2 -translate-x-1/2 ${left || right ? "top-[14%] w-[40%]" : "top-1/2 w-[46%] -translate-y-1/2"}`}>
        <StageProduct p={main} size={160} className="hero-float" />
      </div>
      <span className="hero-float absolute left-[2%] top-[14%] rounded-2xl border border-[#174D36]/15 bg-white/70 px-3.5 py-2 text-[13px] text-[#174D36] backdrop-blur max-sm:px-2.5 max-sm:py-1 max-sm:text-[11px]" style={{ animationDuration: "7s" }}>
        100% Ayurvedic
      </span>
      <span className="hero-float absolute right-0 top-[30%] rounded-2xl border border-[#174D36]/15 bg-white/70 px-3.5 py-2 text-[13px] text-[#174D36] backdrop-blur max-sm:px-2.5 max-sm:py-1 max-sm:text-[11px]" style={{ animationDuration: "7s", animationDelay: "-3s" }}>
        Expert-guided
      </span>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#397C42]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
  );
}

export function BannerSlider({ banners, products = [], trust = [] }: { banners: BannerData[]; products?: HeroProduct[]; trust?: string[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!n) return null;
  const b = banners[i];
  const lines = b.title.split(/\r?\n/).filter(Boolean);
  const head = lines.length > 1 ? lines.slice(0, -1) : lines;
  const last = lines.length > 1 ? lines[lines.length - 1] : null;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const chips = trust.slice(0, 3);

  const arrows =
    n > 1 ? (
      <>
        <button type="button" onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-forest shadow-sm transition hover:bg-white md:grid lg:left-6">‹</button>
        <button type="button" onClick={() => go(1)} aria-label="Next banner" className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-forest shadow-sm transition hover:bg-white md:grid lg:right-6">›</button>
      </>
    ) : null;

  const dots =
    n > 1 ? (
      <div className="flex items-center gap-2">
        {banners.map((x, k) => (
          <button key={x.id} type="button" aria-label={`Show banner ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className={`h-2.5 rounded-full transition-all ${k === i ? `w-6 ${b.imageDesktop ? "bg-[#E7C88F]" : "bg-[#174D36]"}` : `w-2.5 ${b.imageDesktop ? "bg-white/60" : "bg-white"}`}`} />
        ))}
      </div>
    ) : null;

  // Photo banner: the picture fills the screen edge to edge.
  // With text: on desktop the writing sits on the photo's open left side; on phones the photo is on top
  // and the writing sits on a panel below it (colour from "Background colour"), so no pack is covered.
  // Without a small line or supporting text (writing already in the picture), the whole banner is one link.
  if (b.imageDesktop) {
    const hasText = Boolean(b.eyebrow.trim() || b.subtitle.trim());
    const panel = PANELS[b.theme] ?? PANELS.green;
    return (
      <section aria-roledescription="carousel" aria-label="Featured" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative overflow-hidden" style={{ background: panel }}>
        {!hasText ? (
          <Link key={b.id} href={b.ctaHref} aria-label={b.ctaLabel || "View offer"} className="fade-in relative block h-[calc(100svh-104px-64px)] min-h-[520px] md:h-[calc(100svh-170px)] md:min-h-[560px]">
            {b.imageMobile && <Image src={b.imageMobile} alt="" fill priority className="object-cover md:hidden" sizes="100vw" />}
            <Image src={b.imageDesktop} alt="" fill priority className={`object-cover ${b.imageMobile ? "hidden md:block" : ""}`} sizes="100vw" />
          </Link>
        ) : (
          <div key={b.id} className="fade-in relative flex min-h-[calc(100svh-104px-64px)] flex-col md:block md:h-[calc(100svh-170px)] md:min-h-[560px]">
            {/* photo */}
            <div className="relative aspect-square max-h-[56svh] w-full md:absolute md:inset-0 md:aspect-auto md:max-h-none">
              {b.imageMobile && <Image src={b.imageMobile} alt="" fill priority className="object-cover object-[50%_45%] md:hidden" sizes="100vw" />}
              <Image src={b.imageDesktop} alt="" fill priority className={`object-cover object-right ${b.imageMobile ? "hidden md:block" : ""}`} sizes="100vw" />
              {/* phones: fade the photo into the text panel */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 md:hidden" style={{ background: `linear-gradient(to bottom, transparent, ${panel})` }} />
              {/* desktop: soft shade on the left so the writing reads clearly */}
              <div className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.32) 34%, rgba(0,0,0,0) 58%)" }} />
            </div>
            {/* writing */}
            <div className="container-x relative -mt-6 flex flex-1 flex-col items-center justify-center pb-6 text-center text-white md:mt-0 md:h-full md:items-start md:pb-16 md:text-left lg:px-16">
              <div className="flex w-full flex-col items-center md:max-w-[560px] md:items-start">
                {b.eyebrow && <p className="hero-in text-[11px] font-medium uppercase tracking-[.14em] text-[#E7C88F] sm:text-[13px]">{b.eyebrow}</p>}
                <h1 className="hero-in mt-2 text-[clamp(28px,4.2vw,62px)] leading-[1.1] [text-shadow:0_2px_18px_rgba(0,0,0,.35)] sm:mt-3" style={{ animationDelay: ".06s" }}>
                  {head.map((l, k) => <span key={k} className="block">{l}</span>)}
                  {last && <span className="block text-[#E7C88F]">{last}</span>}
                </h1>
                {b.subtitle && <p className="hero-in mt-3 max-w-[460px] text-[14px] leading-6 text-white/85 sm:mt-5 sm:text-lg sm:leading-8" style={{ animationDelay: ".12s" }}>{b.subtitle}</p>}
                {b.ctaLabel && (
                  <Link href={b.ctaHref} className="hero-in mt-5 inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-white px-10 text-base font-medium text-[#174D36] transition-colors hover:bg-[#F4EBD2] sm:mt-8 md:h-14 md:w-auto" style={{ animationDelay: ".18s" }}>
                    {b.ctaLabel}
                  </Link>
                )}
                {chips.length > 0 && (
                  <ul className="hero-in mt-4 flex w-full justify-between gap-1 md:mt-7 md:w-auto md:justify-start md:gap-5" style={{ animationDelay: ".24s" }}>
                    {chips.map((x) => (
                      <li key={x} className="flex items-center gap-1 whitespace-nowrap text-[11px] text-white/85 md:gap-1.5 md:text-sm">
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#E7C88F]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
        {arrows}
        {dots && <div className="absolute bottom-5 right-6 z-10 hidden md:block lg:right-10">{dots}</div>}
        {dots && <div className="flex justify-center pb-4 md:hidden">{dots}</div>}
      </section>
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden text-[#174D36]"
      style={{ background: BACKGROUNDS[b.theme] ?? BACKGROUNDS.green }}
    >
      {/* large leaves at the left edge and behind the podium */}
      <svg viewBox="0 0 200 420" aria-hidden="true" className="pointer-events-none absolute -bottom-6 -left-6 hidden w-[150px] opacity-60 md:block lg:w-[190px]"><path d="M40 420C-10 300 20 120 150 10c40 150 10 330-110 410z" fill="#8FA36A" /><path d="M45 410C70 300 110 160 148 16" stroke="#C9D3A8" strokeWidth="2" fill="none" /></svg>
      <svg viewBox="0 0 200 420" aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 w-[90px] opacity-40 md:hidden"><path d="M40 420C-10 300 20 120 150 10c40 150 10 330-110 410z" fill="#8FA36A" /></svg>
      <svg viewBox="0 0 200 420" aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-10 w-[90px] -scale-x-100 opacity-40 md:hidden"><path d="M40 420C-10 300 20 120 150 10c40 150 10 330-110 410z" fill="#8FA36A" /></svg>

      <div key={b.id} className="fade-in container-x relative grid min-h-[calc(100svh-104px-64px)] content-center items-center gap-4 pb-6 pt-5 text-center md:min-h-[calc(100svh-170px)] md:grid-cols-[1.1fr_.9fr] md:gap-8 md:pb-24 md:pt-8 md:text-left lg:px-16">
        {/* artwork: top half on phones, right side on desktop */}
        <div className="order-first md:order-last">
          <Stage products={products} theme={b.theme} />
        </div>

        <div className="flex flex-col items-center md:items-start">
          {b.eyebrow && <p className="hero-in text-[11px] font-medium uppercase tracking-[.12em] text-[#397C42] sm:text-[13px]">{b.eyebrow}</p>}
          <h1 className="hero-in mt-2 text-[clamp(32px,4.3vw,66px)] leading-[1.08] md:whitespace-nowrap sm:mt-3" style={{ animationDelay: ".06s" }}>
            {head.map((l, k) => <span key={k} className="block text-[#174D36]">{l}</span>)}
            {last && <span className="block text-[#397C42]">{last}</span>}
          </h1>
          {b.subtitle && (
            <p className="hero-in mt-3 max-w-[480px] text-[14px] leading-6 text-[#343B35] sm:mt-5 sm:text-lg sm:leading-8" style={{ animationDelay: ".12s" }}>{b.subtitle}</p>
          )}
          <div className="hero-in mt-5 flex w-full flex-col gap-3 sm:mt-8 md:w-auto md:flex-row md:gap-4" style={{ animationDelay: ".18s" }}>
            <Link href={b.ctaHref} className="inline-flex h-[52px] w-full items-center justify-center rounded-lg bg-[#174D36] px-10 text-base font-medium text-white transition-colors hover:bg-[#397C42] md:h-14 md:w-auto md:min-w-[170px]">
              {b.ctaLabel}
            </Link>
            {b.ctaHref !== "/consult" && (
              <Link href="/consult" className="inline-flex h-[52px] w-full items-center justify-center rounded-lg border-[1.5px] border-[#174D36] px-9 text-base font-medium text-[#174D36] transition-colors hover:bg-white/50 md:h-14 md:w-auto">
                <span className="md:hidden">Consult an Expert</span>
                <span className="hidden md:inline">Book a Consultation</span>
              </Link>
            )}
          </div>
          {chips.length > 0 && (
            <ul className="hero-in mt-5 flex w-full flex-nowrap justify-between gap-1 sm:mt-8 md:w-auto md:flex-wrap md:justify-start md:gap-3" style={{ animationDelay: ".24s" }}>
              {chips.map((x) => (
                <li key={x} className="flex items-center gap-1 whitespace-nowrap text-[11px] text-[#343B35] md:gap-1.5 md:rounded-full md:bg-[#FBF6EA] md:px-4 md:py-2 md:text-sm md:shadow-[0_1px_2px_rgba(0,0,0,.06)]">
                  <Check /> {x}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {arrows}
      {dots && <div className="absolute bottom-6 right-6 z-10 hidden md:block lg:right-10">{dots}</div>}
      <a href="#concerns" aria-label="Scroll to explore" className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-0.5 text-[11px] font-medium tracking-[.2em] text-[#174D36] md:flex">
        SCROLL
        <svg viewBox="0 0 20 12" className="scroll-bob h-3 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 2l7 7 7-7" /></svg>
      </a>
    </section>
  );
}
