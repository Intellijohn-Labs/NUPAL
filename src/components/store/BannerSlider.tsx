"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type BannerData = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageDesktop: string | null;
  imageMobile: string | null;
  theme: string;
};

const THEMES: Record<string, { bg: string; fg: string; sub: string; btn: string }> = {
  cream: { bg: "bg-cream", fg: "text-ink", sub: "text-muted", btn: "btn-primary" },
  green: { bg: "bg-forest", fg: "text-cream", sub: "text-[#c9d4c8]", btn: "btn-gold" },
  brown: { bg: "bg-[#efe4d3]", fg: "text-ink", sub: "text-muted", btn: "btn-primary" },
};

export function BannerSlider({ banners }: { banners: BannerData[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!n) return null;
  const b = banners[i];
  const t = THEMES[b.theme] ?? THEMES.cream;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className={`relative overflow-hidden ${t.bg}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div key={b.id} className="fade-in">
        {b.imageDesktop ? (
          <Link href={b.ctaHref} aria-label={b.title} className={`relative block ${b.imageMobile ? "aspect-[4/5]" : "aspect-[16/6]"} sm:aspect-[16/6]`}>
            {b.imageMobile && <Image src={b.imageMobile} alt={b.title} fill priority className="object-cover sm:hidden" sizes="100vw" />}
            <Image src={b.imageDesktop} alt={b.title} fill priority className={`object-cover ${b.imageMobile ? "hidden sm:block" : ""}`} sizes="100vw" />
          </Link>
        ) : (
          <div className="container-x grid min-h-[380px] items-center gap-8 py-14 sm:min-h-[460px] md:grid-cols-[1.1fr_.9fr]">
            <div className="flex flex-col items-start gap-5">
              <h1 className={`max-w-[16ch] text-[clamp(34px,5vw,62px)] leading-[1.08] ${t.fg}`}>{b.title}</h1>
              {b.subtitle && <p className={`max-w-[46ch] text-lg leading-8 ${t.sub}`}>{b.subtitle}</p>}
              <Link href={b.ctaHref} className={t.btn}>
                {b.ctaLabel}
              </Link>
            </div>
            <BannerArt theme={b.theme} />
          </div>
        )}
      </div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
          {banners.map((x, k) => (
            <button
              key={x.id}
              type="button"
              aria-label={`Show banner ${k + 1}`}
              aria-current={k === i}
              onClick={() => setI(k)}
              className={`h-2.5 rounded-full transition-all ${k === i ? "w-7 bg-sage" : "w-2.5 bg-[#cfc5b0]"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BannerArt({ theme }: { theme: string }) {
  const dark = theme === "green";
  return (
    <svg viewBox="0 0 420 340" className="mx-auto hidden w-full max-w-[440px] md:block" aria-hidden="true">
      <circle cx="210" cy="170" r="150" fill={dark ? "#2B4E37" : "#E6DDCB"} />
      <path d="M60 300c20-70 90-110 160-95-30 65-95 100-160 95z" fill={dark ? "#3E7348" : "#72BF44"} opacity=".8" />
      <path d="M380 290c-25-60-85-90-150-75 35 55 95 85 150 75z" fill={dark ? "#4F8A5B" : "#8FB384"} />
      <ellipse cx="210" cy="300" rx="130" ry="14" fill="#000" opacity=".12" />
      <rect x="165" y="70" width="70" height="34" rx="7" fill="#1F3D2B" />
      <rect x="145" y="100" width="110" height="196" rx="22" fill="#2C5A3D" />
      <rect x="157" y="160" width="86" height="78" rx="5" fill="#F3EEE2" />
      <path d="M200 180c-7 5-7 12 0 17 7-5 7-12 0-17z" fill="none" stroke="#913810" strokeWidth="2" />
      <rect x="175" y="206" width="50" height="5" rx="2.5" fill="#2C5A3D" />
      <rect x="182" y="217" width="36" height="4" rx="2" fill="#2C5A3D" opacity=".5" />
      <rect x="270" y="20" width="12" height="120" rx="6" fill="#913810" transform="rotate(28 276 80)" />
    </svg>
  );
}
