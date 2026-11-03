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

const THEMES: Record<string, { bg: string; fg: string; sub: string; accent: string; eyebrow: string; btn: string; btn2: string; disc: string; leaf: [string, string, string] }> = {
  green: {
    bg: "bg-forest",
    fg: "text-cream",
    sub: "text-[#c9d4c8]",
    accent: "text-gold",
    eyebrow: "text-gold",
    btn: "btn-gold",
    btn2: "btn border border-white/35 text-cream hover:bg-white/10",
    disc: "radial-gradient(circle at 50% 45%, #2E5A3F, #234A33 60%, transparent 61%)",
    leaf: ["#3E7348", "#4F8A5B", "#2F6B45"],
  },
  cream: {
    bg: "bg-cream",
    fg: "text-ink",
    sub: "text-muted",
    accent: "text-sage",
    eyebrow: "text-sage",
    btn: "btn-primary",
    btn2: "btn border border-ink/25 text-ink hover:bg-white",
    disc: "radial-gradient(circle at 50% 45%, #ECE4D4, #E6DDCB 60%, transparent 61%)",
    leaf: ["#72BF44", "#8FB384", "#567459"],
  },
  brown: {
    bg: "bg-[#efe4d3]",
    fg: "text-ink",
    sub: "text-muted",
    accent: "text-pestle",
    eyebrow: "text-pestle",
    btn: "btn-primary",
    btn2: "btn border border-ink/25 text-ink hover:bg-white",
    disc: "radial-gradient(circle at 50% 45%, #E6D6BC, #DFCDB0 60%, transparent 61%)",
    leaf: ["#8FB384", "#72BF44", "#567459"],
  },
};

function Product({ p, className, size }: { p: HeroProduct | undefined; className: string; size: number }) {
  if (!p) return null;
  return (
    <div className={className}>
      {p.image ? (
        <div className="relative aspect-[3/4] w-full">
          <Image src={p.image} alt="" fill sizes="240px" className="object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,.25)]" />
        </div>
      ) : (
        <ProductArt name={p.name} type={p.type} size={size} />
      )}
    </div>
  );
}

/** The decorative product composition on the right of a text banner. */
function Stage({ products, theme }: { products: HeroProduct[]; theme: (typeof THEMES)[string] }) {
  const [main, left, right] = products;
  return (
    <div aria-hidden="true" className="hero-in relative mx-auto hidden aspect-square w-full max-w-[480px] md:block" style={{ animationDelay: ".15s" }}>
      <div className="absolute inset-0 rounded-full border border-dashed border-gold/40" />
      <div className="absolute inset-[6%] rounded-full" style={{ background: theme.disc }} />
      <svg viewBox="0 0 400 400" className="hero-sway absolute inset-0">
        <path d="M40 330c20-90 100-140 190-120-35 80-110 125-190 120z" fill={theme.leaf[0]} />
        <path d="M370 320c-30-80-100-120-180-100 40 70 110 110 180 100z" fill={theme.leaf[1]} />
        <path d="M60 120c40-60 120-70 170-30-40 45-120 60-170 30z" fill={theme.leaf[2]} opacity=".8" />
      </svg>
      <Product p={left} size={92} className="absolute bottom-[16%] left-[10%] w-[26%]" />
      <Product p={right} size={92} className="absolute bottom-[16%] right-[8%] w-[26%]" />
      <Product p={main} size={150} className="hero-float absolute left-1/2 top-1/2 w-[40%] -translate-x-1/2 -translate-y-[52%]" />
      <span className="hero-float absolute left-[2%] top-[14%] rounded-2xl border border-white/30 bg-white/15 px-3.5 py-2 text-[13px] backdrop-blur" style={{ animationDuration: "7s" }}>
        100% Ayurvedic
      </span>
      <span className="hero-float absolute right-0 top-[30%] rounded-2xl border border-white/30 bg-white/15 px-3.5 py-2 text-[13px] backdrop-blur" style={{ animationDuration: "7s", animationDelay: "-3s" }}>
        Expert-guided
      </span>
    </div>
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
  const t = THEMES[b.theme] ?? THEMES.green;
  const lines = b.title.split(/\r?\n/).filter(Boolean);
  const head = lines.length > 1 ? lines.slice(0, -1) : lines;
  const last = lines.length > 1 ? lines[lines.length - 1] : null;

  const dots =
    n > 1 ? (
      <div className="flex items-center justify-center gap-2">
        {banners.map((x, k) => (
          <button
            key={x.id}
            type="button"
            aria-label={`Show banner ${k + 1}`}
            aria-current={k === i}
            onClick={() => setI(k)}
            className={`h-2.5 rounded-full transition-all ${k === i ? "w-7 bg-gold" : `w-2.5 ${b.imageDesktop || b.theme !== "green" ? "bg-[#cfc5b0]" : "bg-white/30"}`}`}
          />
        ))}
      </div>
    ) : null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative overflow-hidden ${b.imageDesktop ? "pt-5 sm:pt-7" : `${t.bg} ${t.fg}`}`}
    >
      <div key={b.id} className="fade-in">
        {b.imageDesktop ? (
          // Image banners sit inside the page width as a rounded card with a soft shadow.
          <div className="container-x">
            <Link
              href={b.ctaHref}
              aria-label={b.title.replace(/\s+/g, " ")}
              className={`relative block overflow-hidden rounded-3xl shadow-[0_28px_50px_-28px_rgba(31,61,43,.55),0_2px_8px_rgba(0,0,0,.05)] transition-transform duration-500 hover:-translate-y-0.5 ${b.imageMobile ? "aspect-[4/5]" : "aspect-[16/6]"} sm:aspect-[16/6]`}
            >
              {b.imageMobile && <Image src={b.imageMobile} alt={b.title} fill priority className="object-cover sm:hidden" sizes="(max-width: 640px) 100vw, 1240px" />}
              <Image src={b.imageDesktop} alt={b.title} fill priority className={`object-cover ${b.imageMobile ? "hidden sm:block" : ""}`} sizes="(max-width: 640px) 100vw, 1240px" />
            </Link>
          </div>
        ) : (
          <div className="container-x grid items-center gap-10 pb-24 pt-12 sm:pt-16 md:min-h-[560px] md:grid-cols-[1.05fr_.95fr]">
            <div className="flex flex-col items-start">
              {b.eyebrow && (
                <p className={`hero-in text-xs font-medium uppercase tracking-[.18em] ${t.eyebrow}`}>{b.eyebrow}</p>
              )}
              <h1 className="hero-in mt-3 text-[clamp(38px,5.4vw,72px)] leading-[1.04]" style={{ animationDelay: ".08s" }}>
                {head.map((l, k) => (
                  <span key={k} className="block">{l}</span>
                ))}
                {last && <span className={`block ${t.accent}`}>{last}</span>}
              </h1>
              {b.subtitle && (
                <p className={`hero-in mt-5 max-w-[470px] text-lg font-light leading-8 ${t.sub}`} style={{ animationDelay: ".16s" }}>
                  {b.subtitle}
                </p>
              )}
              <div className="hero-in mt-7 flex flex-wrap gap-3" style={{ animationDelay: ".24s" }}>
                <Link href={b.ctaHref} className={t.btn}>{b.ctaLabel}</Link>
                {b.ctaHref !== "/consult" && <Link href="/consult" className={t.btn2}>Consult an expert</Link>}
              </div>
              {trust.length > 0 && (
                <ul className={`hero-in mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm ${t.sub}`} style={{ animationDelay: ".32s" }}>
                  {trust.slice(0, 2).map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />
                      </svg>
                      {x}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Stage products={products} theme={t} />
          </div>
        )}
      </div>

      {b.imageDesktop ? (
        dots && <div className="py-4">{dots}</div>
      ) : (
        <>
          {dots && <div className="absolute inset-x-0 bottom-16 z-10">{dots}</div>}
          {/* Soft wave into the next section */}
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 -bottom-px block h-[60px] w-full">
            <path d="M0 30C240 70 480 70 720 40S1200 0 1440 30V60H0z" fill="#fff" />
          </svg>
        </>
      )}
    </section>
  );
}
