import Link from "next/link";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { DnaDrift } from "./ScrollFx";
import { TornEdge } from "./TornEdge";

export type Heritage = {
  show?: boolean;
  eyebrow?: string;
  title?: string;
  quote?: string;
  body?: string;
  year?: number | null;
  stats?: { value: number | string; suffix: string; label: string }[];
  certs?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export const WHY_BG = "#F4EBD2";

/**
 * “Why Nupal”: the short story beside NUPAL’s DNA, three facts, four proof cards and the certificate strip.
 * `joinAbove`: the consult section above ends with a wave in this colour.
 */
export function HeritageBand({ h, proof = [], joinAbove = false }: { h: Heritage; proof?: { title: string; text: string }[]; joinAbove?: boolean }) {
  if (h.show === false || !h.title) return null;
  const lines = h.title.split(/\r?\n/).filter(Boolean);
  return (
    <section aria-labelledby="why-h" className={`relative mb-14 bg-[#F4EBD2] pb-14 sm:mb-20 sm:pb-20 ${joinAbove ? "pt-10 sm:pt-14" : "mt-16 pt-14 sm:mt-20 sm:pt-20"}`}>
      {!joinAbove && <TornEdge fill={WHY_BG} at="top" />}
      <TornEdge fill={WHY_BG} at="bottom" />
      <div className="container-x">
        <div className="grid items-center gap-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
          <Reveal from="left" className="relative mx-auto aspect-square w-full max-w-[250px] sm:max-w-[380px] lg:max-w-[460px]">
            <DnaDrift className="absolute inset-0" />
            {h.year ? (
              <div className="hero-float absolute bottom-[12%] right-[4%] flex h-24 w-24 flex-col items-center justify-center rounded-full bg-maroon text-center text-cream shadow-[0_24px_48px_-24px_rgba(55,9,9,.6)] before:absolute before:inset-[6px] before:rounded-full before:border before:border-dashed before:border-gold/60 sm:h-[130px] sm:w-[130px]" style={{ animationDuration: "7s" }}>
                <span className="text-[10px] uppercase tracking-[.14em] sm:text-xs">Since</span>
                <span className="font-display text-[26px] leading-none text-gold sm:text-[36px]">{h.year}</span>
              </div>
            ) : null}
          </Reveal>
          <Reveal from="right">
            {h.eyebrow && <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#8A5310]">{h.eyebrow}</p>}
            <h2 id="why-h" className="mt-1.5 text-[clamp(28px,3.4vw,44px)] leading-tight">
              {lines.map((l, i) => (
                <span key={i} className="block">{l}</span>
              ))}
            </h2>
            {h.quote && <p className="mt-4 font-display text-[clamp(20px,2.1vw,26px)] leading-snug text-maroon">“{h.quote.replace(/^[“"]|[”"]$/g, "")}”</p>}
            {h.body && <p className="mt-4 text-[16px] leading-8 text-muted sm:text-[17px]">{h.body}</p>}
            {!!h.stats?.length && (
              <ul className="mt-5 grid grid-cols-3 gap-3 border-t border-maroon/15 pt-4">
                {h.stats.slice(0, 3).map((s, i) => {
                  const num = typeof s.value === "number" || /^\d+$/.test(String(s.value));
                  return (
                    <li key={i} className="flex flex-col">
                      <span className="font-display text-[22px] leading-none text-maroon sm:text-[28px]">
                        {num && Number(s.value) < 1800 ? <CountUp to={Number(s.value)} /> : s.value}
                        {s.suffix}
                      </span>
                      <span className="mt-1 min-h-[2.6em] text-xs leading-snug text-muted sm:text-[13px]">{s.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {h.ctaLabel && h.ctaHref && (
              <Link href={h.ctaHref} className="btn-primary mt-4 w-full sm:w-auto">{h.ctaLabel}</Link>
            )}
          </Reveal>
        </div>

        {proof.length > 0 && (
          <ul className="mt-9 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {proof.slice(0, 4).map((p, i) => (
              <li key={p.title}>
                <Reveal index={i} className="h-full">
                  <div className="flex h-full flex-col gap-1 rounded-[18px] bg-white p-4 sm:p-5">
                    <span className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE3C2] text-[#8A5310]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />
                      </svg>
                    </span>
                    <span className="flex min-h-[2.5em] items-end font-medium leading-tight sm:min-h-0">{p.title}</span>
                    {p.text && <span className="text-[13px] leading-snug text-muted">{p.text}</span>}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        {!!h.certs?.length && (
          <Reveal className="mt-7 flex flex-col items-center gap-2.5 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <p className="text-xs uppercase tracking-[.14em] text-muted">Certified for quality, safety and purity</p>
            <ul className="flex flex-nowrap gap-1.5 sm:gap-2.5">
              {h.certs.map((c) => (
                <li key={c} className="whitespace-nowrap rounded-[10px] border border-maroon/20 bg-white px-2.5 py-2 text-[10.5px] font-semibold tracking-[.04em] text-maroon sm:px-4 sm:text-xs sm:tracking-[.08em]">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
