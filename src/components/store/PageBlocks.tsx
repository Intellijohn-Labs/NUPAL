import ReactMarkdown from "react-markdown";
import type { CardsData, GalleryData, IntroData, LogosData, MessageData, PeopleData, StatsData, TextData, TimelineData } from "@/lib/blocks";
import { CountUp } from "./CountUp";
import { ScrollZoom, TimelineLine } from "./ScrollFx";
import { PhotoGallery } from "./PhotoGallery";
import { Reveal } from "./Reveal";

type Block = { id: string; type: string; title: string; anchor: string; data: unknown };

function Initials({ name, size }: { name: string; size: number }) {
  const t = name.replace(/^(Dr|Mr|Mrs|Ms|Shri|Smt)\.?\s+/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  return (
    <span aria-hidden="true" className="flex items-center justify-center rounded-full bg-[#dcd3c1] font-display text-forest" style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {t}
    </span>
  );
}

export function PageBlock({ b }: { b: Block }) {
  const d = (b.data ?? {}) as Record<string, unknown>;
  const heading = b.title ? <h2 className="mb-6 text-[clamp(28px,3.4vw,44px)] leading-tight">{b.title}</h2> : null;

  if (b.type === "intro") {
    const t = d as IntroData;
    return (
      <div>
        <Reveal className="mx-auto max-w-3xl text-center">
          {t.eyebrow && <p className="text-xs font-medium uppercase tracking-[.18em] text-sage">{t.eyebrow}</p>}
          {b.title && <h2 className="mt-2 text-[clamp(34px,4.6vw,60px)] leading-[1.05]">{b.title}</h2>}
        </Reveal>
        {t.image && (
          <Reveal from="zoom" className="mt-10">
            <ScrollZoom src={t.image} alt="" className="aspect-[16/9] rounded-[28px] shadow-[0_30px_60px_-34px_rgba(31,61,43,.6)] sm:aspect-[21/9]" />
          </Reveal>
        )}
        {(t.body || t.name) && (
          <div className="mt-10 grid grid-cols-1 items-end gap-8 md:grid-cols-[1.5fr_.5fr]">
            <Reveal from="left" className="prose-nupal text-[18px] leading-8">
              <ReactMarkdown>{t.body ?? ""}</ReactMarkdown>
            </Reveal>
            {t.name && (
              <Reveal from="right" className="border-l-2 border-gold pl-5">
                <p className="font-display text-2xl italic text-forest">{t.name}</p>
                {t.role && <p className="mt-1 text-sm text-muted">{t.role}</p>}
              </Reveal>
            )}
          </div>
        )}
      </div>
    );
  }

  if (b.type === "stats") {
    const stats = (d as StatsData).stats ?? [];
    if (!stats.length) return null;
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-forest px-6 py-10 text-cream sm:px-10 sm:py-12">
        <svg viewBox="0 0 400 400" className="pointer-events-none absolute -right-16 -top-20 w-72 opacity-10" aria-hidden="true">
          <path d="M40 330c20-90 100-140 190-120-35 80-110 125-190 120z M370 320c-30-80-100-120-180-100 40 70 110 110 180 100z" fill="#C9D4C8" />
        </svg>
        {heading && <div className="relative [&_h2]:text-cream">{heading}</div>}
        <ul className={`relative grid gap-8 text-center ${stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
          {stats.map((s, i) => (
            <li key={i}>
              <Reveal index={i} from="zoom">
                <p className="font-display text-[clamp(40px,5vw,64px)] leading-none text-gold">
                  <CountUp to={s.value} />
                  {s.suffix}
                </p>
                <p className="mt-2 text-sm uppercase tracking-[.12em] text-[#c9d4c8]">{s.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (b.type === "timeline") {
    const items = (d as TimelineData).items ?? [];
    return (
      <div>
        {heading && <Reveal className="text-center">{heading}</Reveal>}
        <ol className="relative mt-6 flex flex-col gap-10 md:gap-8">
          <TimelineLine />
          {items.map((m, i) => {
            const right = i % 2 === 1;
            return (
              <li key={i} className="relative grid grid-cols-1 pl-14 md:grid-cols-2 md:pl-0">
                <span aria-hidden="true" className="absolute left-[11px] top-1 z-10 h-[18px] w-[18px] rounded-full border-4 border-white bg-gold shadow md:left-1/2 md:-ml-[9px]" />
                <Reveal from={right ? "right" : "left"} className={right ? "md:col-start-2 md:pl-12" : "md:pr-12 md:text-right"}>
                  <p className="font-display text-3xl text-gold">{m.year}</p>
                  <p className="mt-1 font-display text-xl">{m.title}</p>
                  {m.text && <p className="mt-2 leading-7 text-muted">{m.text}</p>}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  if (b.type === "cards") {
    const c = d as CardsData;
    const cards = c.cards ?? [];
    return (
      <div className="rounded-[28px] bg-cream px-6 py-10 sm:px-10 sm:py-12">
        {(heading || c.intro) && (
          <Reveal className="mb-8 max-w-2xl">
            {heading}
            {c.intro && <p className="-mt-2 text-lg leading-8 text-muted">{c.intro}</p>}
          </Reveal>
        )}
        <ul className={`grid gap-4 sm:grid-cols-2 ${cards.length >= 4 ? "lg:grid-cols-4" : cards.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {cards.map((x, i) => (
            <li key={i}>
              <Reveal index={i} className="h-full">
                <div className="group flex h-full flex-col rounded-2xl bg-white p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_44px_-28px_rgba(31,61,43,.55)]">
                  <span className="font-display text-5xl leading-none text-gold/80 transition-colors group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-5 block h-px w-10 bg-sage transition-all duration-500 group-hover:w-16" />
                  <p className="mt-4 font-display text-xl">{x.title}</p>
                  {x.text && <p className="mt-2 leading-7 text-muted">{x.text}</p>}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (b.type === "text") {
    const t = d as TextData;
    const left = t.imageSide === "left";
    return (
      <div className={`grid items-center gap-10 ${t.image ? "md:grid-cols-2 md:gap-14" : "max-w-3xl"}`}>
        <Reveal from={t.image ? (left ? "right" : "left") : "up"} className={`${t.image && left ? "md:order-2" : ""}`}>
          {heading}
          <div className="prose-nupal checks text-[17px]">
            <ReactMarkdown>{t.body ?? ""}</ReactMarkdown>
          </div>
        </Reveal>
        {t.image && (
          <Reveal from={left ? "left" : "right"} className="relative">
            <span aria-hidden="true" className={`absolute -bottom-4 h-2/3 w-2/3 rounded-[28px] bg-cream ${left ? "-left-4" : "-right-4"}`} />
            <ScrollZoom src={t.image} alt="" className="relative aspect-[4/3] rounded-[24px] shadow-[0_24px_48px_-30px_rgba(31,61,43,.6)]" />
          </Reveal>
        )}
      </div>
    );
  }

  if (b.type === "message") {
    const m = d as MessageData;
    return (
      <Reveal>
        {heading}
        <figure className="m-0 grid grid-cols-1 items-start gap-8 rounded-3xl bg-cream p-6 sm:p-8 md:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            {m.photo ? <img src={m.photo} alt={m.name ?? ""} className="aspect-[4/5] w-44 rounded-2xl object-cover md:w-full" /> : m.name ? <Initials name={m.name} size={120} /> : null}
          </div>
          <div>
            <svg width="36" height="28" viewBox="0 0 36 28" aria-hidden="true" className="mb-3"><path d="M0 28V16C0 7 5 1 14 0v6c-5 1-7 4-7 9h7v13zm20 0V16c0-9 5-15 14-16v6c-5 1-7 4-7 9h7v13z" fill="#C9A45C" /></svg>
            <blockquote className="prose-nupal m-0 text-[17px]"><ReactMarkdown>{m.body ?? ""}</ReactMarkdown></blockquote>
            {(m.name || m.role) && (
              <figcaption className="mt-5 border-t border-line pt-4">
                {m.name && <p className="font-display text-xl">{m.name}</p>}
                {m.role && <p className="text-muted">{m.role}</p>}
              </figcaption>
            )}
          </div>
        </figure>
      </Reveal>
    );
  }

  if (b.type === "people") {
    const people = (d as PeopleData).people ?? [];
    return (
      <div>
        {heading && <Reveal>{heading}</Reveal>}
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p, i) => (
            <li key={p.name + i}>
              <Reveal index={i % 3} className="h-full">
                <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-white p-6 text-center">
                  {p.photo ? <img src={p.photo} alt={p.name} loading="lazy" className="h-32 w-32 rounded-full object-cover" /> : <Initials name={p.name} size={128} />}
                  <div>
                    <p className="font-display text-xl">{p.name}</p>
                    {p.role && <p className="text-muted">{p.role}</p>}
                  </div>
                  {p.bio && (
                    <details className="w-full text-left">
                      <summary className="cursor-pointer text-center text-sm font-medium text-sage">Read more</summary>
                      <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-[#3f4a44]">{p.bio}</p>
                    </details>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (b.type === "logos") {
    const logos = (d as LogosData).logos ?? [];
    return (
      <div>
        {heading && <Reveal>{heading}</Reveal>}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {logos.map((l, i) => {
            const inner = (
              <span className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white p-4 text-center">
                {l.image ? <img src={l.image} alt={l.name} loading="lazy" className="h-16 w-full object-contain" /> : null}
                <span className={`text-sm ${l.image ? "text-muted" : "font-medium"}`}>{l.name}</span>
              </span>
            );
            return (
              <li key={l.name + i}>
                <Reveal index={i % 5} from="zoom" className="h-full">
                  {l.url ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="block h-full hover:opacity-80">{inner}<span className="sr-only"> (opens in a new tab)</span></a> : inner}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (b.type === "gallery") {
    return (
      <div>
        {heading && <Reveal>{heading}</Reveal>}
        <PhotoGallery images={(d as GalleryData).images ?? []} title={b.title || "Gallery"} />
      </div>
    );
  }
  return null;
}
