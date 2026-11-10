import ReactMarkdown from "react-markdown";
import type { DuoData, FounderData, CardsData, GalleryData, IntroData, LogosData, MessageData, PeopleData, StatsData, TextData, TimelineData } from "@/lib/blocks";
import { CountUp } from "./CountUp";
import { DnaDrift, DnaSpine, ScrollZoom } from "./ScrollFx";
import { PhotoGallery } from "./PhotoGallery";
import { Reveal } from "./Reveal";

type Block = { id: string; type: string; title: string; anchor: string; data: unknown };

const PALETTE: [string, string][] = [
  ["#E3F6F1", "#2E7D4F"],
  ["#FFF4C7", "#9A7300"],
  ["#FDEBDD", "#C4501B"],
  ["#EEF8DD", "#4E8A16"],
  ["#FDE4E6", "#C23B4E"],
  ["#F3E8FB", "#8A55B8"],
];

function Initials({ name, size }: { name: string; size: number }) {
  const words = name.replace(/^(Dr|Mr|Mrs|Ms|Shri|Smt)\.?\s+/i, "").replace(/\./g, " ").split(/\s+/).filter(Boolean);
  const t = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? "").slice(0, 2)).toUpperCase();
  return (
    <span aria-hidden="true" className="flex items-center justify-center rounded-full bg-sunny font-display text-forest-deep" style={{ width: size, height: size, fontSize: size * 0.34 }}>
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
      <div className={`grid items-center gap-10 ${t.image ? "md:grid-cols-[1.1fr_.9fr] md:gap-12" : ""}`}>
        <Reveal from="left">
          {t.eyebrow && <p className="text-xs font-semibold uppercase tracking-[.18em] text-sage">{t.eyebrow}</p>}
          {b.title && <h2 className="mt-2 text-[clamp(32px,3.8vw,50px)] leading-[1.08]">{b.title}</h2>}
          <div className="prose-nupal intro-lead mt-3 text-[17px]">
            <ReactMarkdown>{t.body ?? ""}</ReactMarkdown>
          </div>
          {t.name && (
            <p className="mt-5 border-l-[3px] border-gold pl-4">
              <span className="block font-display text-xl text-forest-deep">{t.name}</span>
              {t.role && <span className="text-sm text-muted">{t.role}</span>}
            </p>
          )}
        </Reveal>
        {t.image && (
          <Reveal from="right">
            <ScrollZoom src={t.image} alt="" className="aspect-[4/5] rounded-[28px] shadow-[0_30px_60px_-36px_rgba(26,106,64,.6)]" />
          </Reveal>
        )}
      </div>
    );
  }

  if (b.type === "founder") {
    const f = d as FounderData;
    return (
      <div className="relative grid items-center gap-10 overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#ffffff,#eaf8f2)] p-6 sm:p-10 md:grid-cols-[.9fr_1.1fr] md:gap-12">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,#C9A45C_0,rgba(247,203,32,.25)_40%,rgba(247,203,32,0)_70%)]" />
        <Reveal from="left" className="relative mx-auto aspect-square w-full max-w-[440px]">
          <DnaDrift className="absolute -inset-x-[12%] -inset-y-[6%]" />
          <div className="absolute left-[24%] top-[20%] aspect-[4/5] w-[52%] overflow-hidden rounded-[999px_999px_28px_28px] border-[6px] border-white bg-sunny shadow-[0_30px_60px_-30px_rgba(26,106,64,.6)]">
            {f.image ? (
              <img src={f.image} alt={b.title || "Founder"} className="h-full w-full object-cover object-top" />
            ) : (
              <span className="flex h-full items-center justify-center text-sm text-forest">Portrait</span>
            )}
          </div>
          {f.badge && (
            <div className="hero-float absolute bottom-[10%] right-0 rounded-2xl bg-forest px-4 py-3 text-[13px] leading-snug text-white shadow-[0_18px_36px_-18px_rgba(0,0,0,.5)]">
              <span className="block font-display text-xl text-gold">{f.badge}</span>
              {f.badgeSub}
            </div>
          )}
        </Reveal>
        <Reveal from="right" className="relative">
          {f.eyebrow && <p className="text-xs font-semibold uppercase tracking-[.18em] text-sage">{f.eyebrow}</p>}
          {b.title && <h2 className="mt-2 text-[clamp(28px,3.4vw,44px)] leading-tight">{b.title}</h2>}
          {f.quote && <p className="my-5 font-display text-[clamp(20px,2.2vw,27px)] leading-snug text-forest-deep">“{f.quote.replace(/^[“"]|[”"]$/g, "")}”</p>}
          <div className="prose-nupal text-[17px]"><ReactMarkdown>{f.body ?? ""}</ReactMarkdown></div>
        </Reveal>
      </div>
    );
  }

  if (b.type === "duo") {
    const c = d as DuoData;
    const cards = c.cards ?? [];
    return (
      <div>
        <Reveal>
          {c.eyebrow && <p className="text-xs font-semibold uppercase tracking-[.18em] text-sage">{c.eyebrow}</p>}
          {heading}
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {cards.map((x, i) => (
            <Reveal key={i} from={i ? "right" : "left"} className="h-full">
              <div className={`relative h-full overflow-hidden rounded-[26px] p-7 sm:p-8 ${i ? "bg-sage text-white" : "bg-sunny"}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 w-44 opacity-20" fill={i ? "#fff" : "#C49A00"}>
                  <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
                </svg>
                <p className="relative font-display text-2xl leading-tight">{x.title}</p>
                <p className={`relative mt-3 whitespace-pre-line leading-7 ${i ? "text-[#ddf6ef]" : "text-[#4d4520]"}`}>{x.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    );
  }

  if (b.type === "stats") {
    // Dark green panel with gold numbers that count up.
    const stats = (d as StatsData).stats ?? [];
    if (!stats.length) return null;
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-[#1F3D2B] px-6 py-10 text-[#F7F4EE] sm:px-10 sm:py-12">
        <svg viewBox="0 0 400 400" className="pointer-events-none absolute -right-16 -top-20 w-72 opacity-10" aria-hidden="true">
          <path d="M40 330c20-90 100-140 190-120-35 80-110 125-190 120z M370 320c-30-80-100-120-180-100 40 70 110 110 180 100z" fill="#C9D4C8" />
        </svg>
        {heading && <div className="relative [&_h2]:text-[#F7F4EE]">{heading}</div>}
        <ul className={`relative grid gap-x-6 gap-y-8 text-center ${stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
          {stats.map((s, i) => (
            <li key={i} className="min-w-0">
              <Reveal index={i} from="zoom">
                <p className="font-display text-[clamp(34px,3.9vw,56px)] leading-none text-[#C9A45C]">
                  {s.value >= 1800 && s.value <= 2100 && !s.suffix ? <CountUp to={s.value} from={s.value - 60} plain /> : <CountUp to={s.value} />}
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
        <div className="relative py-4">
          <DnaSpine />
          <ol className="relative flex flex-col gap-8 md:gap-0">
            {items.map((m, i) => {
              const right = i % 2 === 1;
              return (
                <li key={i} className="relative grid items-center pl-16 md:min-h-[150px] md:grid-cols-2 md:pl-0">
                  <span aria-hidden="true" className="absolute left-[20px] top-1/2 z-10 -mt-[10px] h-5 w-5 rounded-full border-4 border-white bg-gold shadow-[0_0_0_2px_#D4581E] md:left-1/2 md:-ml-[10px]" />
                  <Reveal from={right ? "right" : "left"} className={right ? "md:col-start-2 md:ml-[90px]" : "md:mr-[90px]"}>
                    <div className={`rounded-[20px] border border-line bg-white px-6 py-5 shadow-[0_16px_36px_-28px_rgba(26,106,64,.5)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_44px_-26px_rgba(31,61,43,.6)] ${right ? "" : "md:text-right"}`}>
                      <p className="font-display text-3xl leading-none text-coral">{m.year}</p>
                      <p className="mt-1.5 font-display text-xl leading-snug">{m.title}</p>
                      {m.text && <p className="mt-1.5 text-[15px] leading-6 text-muted">{m.text}</p>}
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  if (b.type === "cards") {
    const c = d as CardsData;
    const cards = c.cards ?? [];
    return (
      <div>
        {(heading || c.intro) && (
          <Reveal className="mb-6 max-w-2xl">
            {heading}
            {c.intro && <p className="-mt-2 text-lg leading-8 text-muted">{c.intro}</p>}
          </Reveal>
        )}
        <ul className={`grid gap-4 sm:grid-cols-2 ${cards.length >= 4 ? "lg:grid-cols-4" : cards.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {cards.map((x, i) => {
            const [tint, ink] = PALETTE[i % PALETTE.length];
            return (
              <li key={i}>
                <Reveal index={i} className="h-full">
                  <div className="group flex h-full flex-col rounded-[22px] border border-line bg-white p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_44px_-28px_rgba(26,106,64,.55)]">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: tint, color: ink }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />
                        </svg>
                      </span>
                      <span className="font-display text-3xl leading-none" style={{ color: ink }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="mt-5 font-display text-xl leading-snug">{x.title}</p>
                    {x.text && <p className="mt-2 text-[15px] leading-6 text-muted">{x.text}</p>}
                  </div>
                </Reveal>
              </li>
            );
          })}
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
      <div>
        {heading && <Reveal>{heading}</Reveal>}
        <figure className="m-0 grid items-start gap-8 md:grid-cols-[220px_1fr] md:gap-10">
          <Reveal from="left">
            <div className="aspect-[4/5] w-48 overflow-hidden rounded-3xl bg-sunny md:w-full">
              {m.photo ? (
                <img src={m.photo} alt={m.name ?? ""} className="h-full w-full object-cover object-top" />
              ) : m.name ? (
                <span className="flex h-full items-center justify-center"><Initials name={m.name} size={110} /></span>
              ) : null}
            </div>
          </Reveal>
          <Reveal from="right">
            <blockquote className="prose-nupal message-quote m-0 text-[17px]"><ReactMarkdown>{m.body ?? ""}</ReactMarkdown></blockquote>
            {(m.name || m.role) && (
              <figcaption className="mt-5 border-t border-line pt-4">
                {m.name && <p className="font-display text-xl">{m.name}</p>}
                {m.role && <p className="text-muted">{m.role}</p>}
              </figcaption>
            )}
          </Reveal>
        </figure>
      </div>
    );
  }

  if (b.type === "people") {
    const people = (d as PeopleData).people ?? [];
    return (
      <div>
        {heading && <Reveal>{heading}</Reveal>}
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {people.map((p, i) => (
            <li key={p.name + i} className="text-center">
              <Reveal index={i % 4} className="group flex h-full flex-col items-center">
                <span className="mb-3 block h-32 w-32 overflow-hidden rounded-full transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:-rotate-3" style={{ background: PALETTE[i % PALETTE.length][0] }}>
                  {p.photo ? <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover object-top" /> : <span className="flex h-full items-center justify-center font-display text-4xl text-forest-deep">{p.name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "").replace(/\./g, " ").split(/\s+/).filter(Boolean).map((w, k, arr) => (k === 0 || k === arr.length - 1 ? w[0] : "")).join("").toUpperCase()}</span>}
                </span>
                <p className="font-display text-lg leading-snug">{p.name}</p>
                {p.role && <p className="mt-0.5 text-sm leading-snug text-muted">{p.role}</p>}
                {p.qual && <p className="mt-1 text-xs font-semibold text-coral">{p.qual}</p>}
                {p.bio && (
                  <details className="mt-2 w-full text-left">
                    <summary className="cursor-pointer text-center text-sm font-medium text-sage">Read more</summary>
                    <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-[#35514a]">{p.bio}</p>
                  </details>
                )}
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
              <span className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white p-4 text-center grayscale transition-[filter,transform,border-color] duration-500 hover:-translate-y-1 hover:border-leaf hover:grayscale-0">
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
