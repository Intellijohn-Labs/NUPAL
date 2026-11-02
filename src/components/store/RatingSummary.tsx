import Link from "next/link";
import { Stars } from "./Stars";

/** Average, count and a 5→1 breakdown. Each bar links to that star filter. */
export function RatingSummary({ avg, count, byStar, hrefFor, active }: { avg: number; count: number; byStar: (n: number) => number; hrefFor: (n: number | null) => string; active: number | null }) {
  return (
    <div className="rounded-2xl bg-cream p-5">
      <div className="flex items-center gap-3">
        <span className="font-display text-5xl">{avg.toFixed(1)}</span>
        <span>
          <Stars value={avg} size={20} />
          <span className="block text-sm text-muted">{count} {count === 1 ? "review" : "reviews"}</span>
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-1 text-sm">
        {[5, 4, 3, 2, 1].map((n) => {
          const c = byStar(n);
          const on = active === n;
          return (
            <li key={n}>
              <Link
                href={hrefFor(on ? null : n)}
                scroll={false}
                aria-current={on ? "true" : undefined}
                aria-label={`${n} star reviews: ${c}${on ? " (showing, tap to show all)" : ""}`}
                className={`flex items-center gap-2 rounded-lg px-1.5 py-1 ${on ? "bg-white font-semibold" : "hover:bg-white/70"} ${c === 0 ? "pointer-events-none opacity-50" : ""}`}
              >
                <span className="w-8 text-muted">{n} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                  <span className="block h-full rounded-full bg-gold" style={{ width: `${count ? (c / count) * 100 : 0}%` }} />
                </span>
                <span className="w-6 text-right text-muted">{c}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {active && (
        <Link href={hrefFor(null)} scroll={false} className="mt-3 inline-block text-sm font-medium text-sage underline">
          Show all ratings
        </Link>
      )}
    </div>
  );
}
