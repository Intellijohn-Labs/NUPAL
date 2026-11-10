import Link from "next/link";
import { Reveal } from "./Reveal";

export type Collection = { title: string; text: string; href: string };

const BG = ["linear-gradient(135deg,#E3F1DA,#FCF8EC)", "linear-gradient(135deg,#FFF0D6,#FCF8EC)"];

/** Two curated routes into the range (Store settings → Homepage collections). */
export function Collections({ items }: { items: Collection[] }) {
  const list = items.filter((c) => c.title).slice(0, 2);
  if (!list.length) return null;
  return (
    <section aria-labelledby="col-h" className="container-x text-center">
      <Reveal>
        <h2 id="col-h" className="text-[clamp(28px,3.4vw,44px)] leading-tight">Explore More Ways to Care for Yourself</h2>
        <p className="mx-auto mt-2 max-w-[560px] text-muted">Two curated collections that lead into full product ranges.</p>
      </Reveal>
      <div className="mt-7 grid gap-3 text-left sm:grid-cols-2 sm:gap-5">
        {list.map((c, i) => (
          <Reveal key={c.title} index={i}>
            <Link href={c.href || "/shop"} className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1 sm:min-h-[250px] sm:p-7" style={{ background: BG[i % 2] }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute -right-6 -top-6 w-40 opacity-[.18] transition-transform duration-700 group-hover:rotate-6 sm:w-52" fill={i ? "#A45F12" : "#3E7B2C"}>
                <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
              </svg>
              <span className="relative max-w-[80%] font-display text-[24px] leading-tight sm:text-[26px]">{c.title}</span>
              {c.text && <span className="relative mt-1.5 max-w-[80%] leading-6 text-muted">{c.text}</span>}
              <span className="relative mt-3 font-semibold text-brick">Explore Collection →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
