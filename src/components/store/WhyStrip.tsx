import Image from "next/image";
import { Reveal } from "./Reveal";

type Point = { title: string; text: string };

export function WhyStrip({ points }: { points: Point[] }) {
  if (!points.length) return null;
  return (
    <section
      aria-label="Why NUPAL"
      className="relative overflow-hidden border-t border-line"
    >
      {/* DNA helix — decorative, fades in slowly on scroll */}
      <div
        aria-hidden="true"
        className="dna-float pointer-events-none absolute -right-8 -top-4 h-[220%] w-[320px] select-none opacity-[.12] sm:w-[420px]"
      >
        <Image
          src="/brand/dna-helix.png"
          alt=""
          fill
          sizes="360px"
          className="object-contain object-top"
        />
      </div>
      <div
        className={`container-x relative grid gap-6 py-10 sm:grid-cols-2 ${points.length >= 4 ? "lg:grid-cols-4" : points.length === 3 ? "lg:grid-cols-3" : ""}`}
      >
        {points.map((w, i) => (
          <Reveal key={i} index={i} className="flex items-start gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#567459"
              strokeWidth="1.4"
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            >
              <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" />
            </svg>
            <div>
              <p className="font-display text-lg">{w.title}</p>
              {w.text && <p className="mt-0.5 text-sm text-muted">{w.text}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
