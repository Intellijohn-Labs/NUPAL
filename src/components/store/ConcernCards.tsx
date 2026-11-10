import Link from "next/link";
import { iconPath } from "@/lib/icons";
import { Reveal } from "./Reveal";

// Soft tint per card, in the team’s design.
const TINTS = ["#E6EEDF", "#F6E3DD", "#F5EBD3", "#E3EEE8", "#F3E1E6", "#E2ECF1", "#EEE8F6", "#F2EADD"];

export type ConcernCard = { id: string; name: string; slug: string; icon: string; tagline: string };

/** “Wellness Begins with the Right Care”: six concern cards (2 × 3 on phones). The rest are in the menu. */
/** Homepage: first 6 concerns + “Explore All Health Concerns”. The /concerns page passes all to show every concern. */
export function ConcernCards({ concerns, all = false }: { concerns: ConcernCard[]; all?: boolean }) {
  const Heading = all ? "h1" : "h2";
  if (!concerns.length) return null;
  return (
    <section id="concerns" aria-labelledby="concerns-h" className="container-x scroll-mt-32 pt-10 text-center sm:pt-14">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-brick">Shop by health concern</p>
        <Heading id="concerns-h" className="mt-1.5 text-[clamp(28px,3.4vw,44px)] leading-tight">{all ? "All Health Concerns" : "Wellness Begins with the Right Care"}</Heading>
        <p className="mx-auto mt-2 max-w-[560px] text-muted">Explore our Ayurvedic formulations based on your health and wellness needs.</p>
      </Reveal>
      <ul className={`mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 ${all ? "lg:grid-cols-4" : "lg:grid-cols-6"}`}>
        {(all ? concerns : concerns.slice(0, 6)).map((c, i) => (
          <li key={c.id}>
            <Reveal index={i % 3} className="h-full">
              <Link
                href={`/concern/${c.slug}`}
                className="flex h-full flex-col items-center gap-1.5 rounded-[20px] border border-line bg-white px-3 py-5 text-center transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_-26px_rgba(55,9,9,.5)]"
              >
                <span className="mb-1.5 flex h-[60px] w-[60px] items-center justify-center rounded-full text-forest sm:h-[72px] sm:w-[72px]" style={{ background: TINTS[i % TINTS.length] }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={iconPath(c.icon)} />
                  </svg>
                </span>
                <span className="text-[15px] font-semibold text-forest sm:text-base">{c.name}</span>
                {c.tagline && <span className="text-[13px] leading-snug text-muted">{c.tagline}</span>}
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
      {all ? (
        <Link href="/consult" className="mt-8 inline-block font-semibold text-brick underline-offset-4 hover:underline">Not sure which one? Talk to our doctor →</Link>
      ) : (
        <Reveal>
          <Link href="/concerns" className="mt-5 inline-block font-semibold text-brick underline-offset-4 hover:underline">Explore All Health Concerns →</Link>
        </Reveal>
      )}
    </section>
  );
}
