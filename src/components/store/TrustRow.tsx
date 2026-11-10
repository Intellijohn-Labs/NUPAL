/** A row of small round trust icons under the banner (from Store settings → “Why NUPAL” points). Swipeable on phones. */
const ICONS = [
  "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8",
  "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4",
  "M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2M20 12a2 2 0 1 0 0 .01",
  "M3 7h18v10H3zM3 11h18M7 15h3",
  "M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17.5 6.5 21 8 13.5 3 9l6.5-.5z",
];

export function TrustRow({ points }: { points: string[] }) {
  if (!points.length) return null;
  return (
    <ul aria-label="Why shop with NUPAL" className="no-scrollbar container-x flex snap-x snap-mandatory gap-5 overflow-x-auto py-6 sm:justify-center sm:gap-12">
      {points.slice(0, 5).map((p, i) => (
        <li key={p} className="flex w-[92px] shrink-0 snap-start flex-col items-center gap-2 text-center text-xs leading-snug text-muted sm:w-auto sm:max-w-[150px] sm:text-[13px]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-brick">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONS[i % ICONS.length]} />
            </svg>
          </span>
          {p}
        </li>
      ))}
    </ul>
  );
}
