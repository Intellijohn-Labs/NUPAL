"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades and slides its content in when it scrolls into view. `index` staggers items in a row.
 * Content is visible by default (no JavaScript, reduced motion, or already on screen).
 */
export function Reveal({ children, index = 0, className = "", from = "up" }: { children: React.ReactNode; index?: number; className?: string; from?: "up" | "left" | "zoom" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already visible on load
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = from === "left" ? "opacity-0 -translate-x-8" : from === "zoom" ? "opacity-0 scale-95" : "opacity-0 translate-y-10";
  return (
    <div
      ref={ref}
      className={`${className} ${state === "static" ? "" : "transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"} ${state === "hidden" ? hidden : ""}`}
      style={state === "shown" ? { transitionDelay: `${index * 110}ms` } : undefined}
    >
      {children}
    </div>
  );
}
