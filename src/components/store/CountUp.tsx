"use client";

import { useEffect, useRef, useState } from "react";

/** Counts up to `to` once when scrolled into view. Shows the final number without JS or with reduced motion. */
export function CountUp({ to, from = 0, plain = false }: { to: number; from?: number; plain?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setN(from);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        setN(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to, from]);
  return <span ref={ref}>{plain ? n : n.toLocaleString("en-IN")}</span>;
}
