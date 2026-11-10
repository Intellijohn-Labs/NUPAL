"use client";

import { useEffect, useState } from "react";

const Leaf = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="mx-6 shrink-0 text-gold sm:mx-9">
    <path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z" fill="currentColor" />
  </svg>
);

/**
 * Announcement bar as a continuous ticker (like Dr Vaidya’s): all offers scroll past in a loop,
 * separated by small leaves. Pauses while the mouse is over it. With reduced motion it stands still.
 * Messages: Admin → Store settings → Offer bar (one per line).
 */
export function OfferBar({ messages }: { messages: string[] }) {
  const [still, setStill] = useState(false);
  useEffect(() => setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const list = messages.map((m) => m.trim()).filter(Boolean);
  if (!list.length) return null;

  // Repeat the list until one copy is comfortably wider than a large screen, so the loop never shows a gap.
  const chars = list.join("").length + list.length * 8;
  const copies = Math.max(1, Math.ceil(220 / chars));
  const run = Array.from({ length: copies }, () => list).flat();
  const seconds = Math.max(18, Math.round((run.join("").length + run.length * 8) * 0.22));

  const track = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {run.map((m, k) => (
        <span key={k} className="flex shrink-0 items-center whitespace-nowrap">
          {m}
          <Leaf />
        </span>
      ))}
    </div>
  );

  return (
    <div role="region" aria-label="Offers" className="group relative h-9 overflow-hidden bg-forest text-[13px] text-cream">
      {still ? (
        <div className="flex h-full items-center justify-center gap-0 px-3">
          <span className="truncate">{list.join("  ·  ")}</span>
        </div>
      ) : (
        <>
          <span className="sr-only">{list.join(". ")}</span>
          <div className="ticker flex h-full w-max items-center group-hover:[animation-play-state:paused]" style={{ animationDuration: `${seconds}s` }}>
            {track(true)}
            {track(true)}
          </div>
        </>
      )}
    </div>
  );
}
