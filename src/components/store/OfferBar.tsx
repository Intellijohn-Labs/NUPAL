"use client";

import { useEffect, useState } from "react";

/** Slim announcement bar: one message at a time, changing slowly. Arrows on wider screens. */
export function OfferBar({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(false);
  const n = messages.length;

  const go = (d: number) => {
    setFade(true);
    setTimeout(() => {
      setI((x) => (x + d + n) % n);
      setFade(false);
    }, 300);
  };

  useEffect(() => {
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return null;
  return (
    <div className="flex h-9 items-center justify-center gap-3 bg-forest px-3 text-[13px] text-cream" role="region" aria-label="Announcements">
      {n > 1 && (
        <button type="button" onClick={() => go(-1)} aria-label="Previous message" className="hidden h-8 w-8 items-center justify-center text-base text-gold sm:flex">
          ‹
        </button>
      )}
      <span aria-live="polite" className={`truncate transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"}`}>
        {messages[i]}
      </span>
      {n > 1 && (
        <button type="button" onClick={() => go(1)} aria-label="Next message" className="hidden h-8 w-8 items-center justify-center text-base text-gold sm:flex">
          ›
        </button>
      )}
    </div>
  );
}
