"use client";

import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Progress (0 → 1) of an element moving through the viewport, updated on scroll. */
function useScrollProgress<T extends HTMLElement>(start = 1, end = 0.25) {
  const ref = useRef<T>(null);
  const [p, setP] = useState(1);
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top of the element is at `start` × viewport height, 1 when it reaches `end` × viewport height
      const v = (vh * start - r.top) / (vh * (start - end));
      setP(Math.max(0, Math.min(1, v)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [start, end]);
  return [ref, p] as const;
}

/** Wide photo that settles from a slight zoom to normal size as it scrolls into view. */
export function ScrollZoom({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [ref, p] = useScrollProgress<HTMLDivElement>(1, 0.3);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover will-change-transform" style={{ transform: `scale(${1.18 - 0.18 * p})` }} />
    </div>
  );
}

/** Vertical line that fills in as the timeline scrolls past. */
export function TimelineLine() {
  const [ref, p] = useScrollProgress<HTMLDivElement>(0.85, -0.6);
  return (
    <div ref={ref} aria-hidden="true" className="absolute bottom-0 left-[19px] top-0 w-0.5 bg-line md:left-1/2 md:-ml-px">
      <div className="w-full origin-top bg-gold" style={{ height: "100%", transform: `scaleY(${p})` }} />
    </div>
  );
}
