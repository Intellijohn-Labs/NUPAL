import ReactMarkdown from "react-markdown";
import type { GalleryData, LogosData, MessageData, PeopleData, TextData } from "@/lib/blocks";
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
  const heading = b.title ? <h2 className="mb-5 text-[clamp(26px,3vw,36px)]">{b.title}</h2> : null;

  if (b.type === "text") {
    const t = d as TextData;
    return (
      <Reveal>
        {heading}
        <div className={`grid items-start gap-8 ${t.image ? "md:grid-cols-[1.4fr_1fr]" : ""}`}>
          <div className={`prose-nupal text-[17px] ${t.image && t.imageSide === "left" ? "md:order-2" : ""}`}>
            <ReactMarkdown>{t.body ?? ""}</ReactMarkdown>
          </div>
          {t.image && <img src={t.image} alt="" loading="lazy" className="w-full rounded-2xl object-cover" />}
        </div>
      </Reveal>
    );
  }

  if (b.type === "message") {
    const m = d as MessageData;
    return (
      <Reveal>
        {heading}
        <figure className="m-0 grid items-start gap-8 rounded-3xl bg-cream p-6 sm:p-8 md:grid-cols-[220px_1fr]">
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
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
