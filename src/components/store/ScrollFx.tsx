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

/** NUPAL’s DNA illustration that drifts and turns slightly as the page scrolls. */
export function DnaDrift({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState("none");
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current?.parentElement;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const q = (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
      setT(`translateY(${(q * -40).toFixed(1)}px) rotate(${(q * 6).toFixed(2)}deg)`);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`bg-contain bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: "url(/brand/dna-helix.png)", transform: t }}
    />
  );
}

/** Double helix that draws itself down the timeline as it scrolls past; gold rungs light up behind it. */
export function DnaSpine() {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 120, h: 0 });
  const [p, setP] = useState(reduced() ? 1 : 0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (reduced()) {
      setP(1);
      return () => ro.disconnect();
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      setP(Math.max(0, Math.min(1, (window.innerHeight * 0.75 - r.top) / r.height)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const { w, h } = size;
  const mid = w / 2;
  const amp = w * 0.38;
  const turns = Math.max(3, Math.round(h / 170));
  const N = 160;
  let a = "";
  let b = "";
  for (let i = 0; i <= N; i++) {
    const y = (h * i) / N;
    const t = (i / N) * turns * Math.PI * 2;
    a += `${i ? "L" : "M"}${(mid + Math.sin(t) * amp).toFixed(1)} ${y.toFixed(1)}`;
    b += `${i ? "L" : "M"}${(mid - Math.sin(t) * amp).toFixed(1)} ${y.toFixed(1)}`;
  }
  const R = turns * 4;
  const rungs = Array.from({ length: Math.max(0, R - 1) }, (_, k) => {
    const y = (h * (k + 1)) / R;
    const t = ((k + 1) / R) * turns * Math.PI * 2;
    return { y, x1: mid + Math.sin(t) * amp, x2: mid - Math.sin(t) * amp };
  });
  const lim = h * p;

  return (
    <div ref={box} aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 top-0 w-[60px] md:left-1/2 md:w-[120px] md:-translate-x-1/2">
      {h > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <defs>
            <linearGradient id="dna-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E7D4F" /><stop offset="1" stopColor="#72BF44" /></linearGradient>
            <linearGradient id="dna-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1F3D2B" /><stop offset="1" stopColor="#567459" /></linearGradient>
            <clipPath id="dna-clip"><rect x={-20} y={0} width={w + 40} height={lim} /></clipPath>
          </defs>
          <g clipPath="url(#dna-clip)">
            {rungs.map((r, i) => (
              <line key={i} x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} stroke="#C9A45C" strokeWidth="3" strokeLinecap="round" opacity=".7" />
            ))}
            <path d={b} fill="none" stroke="url(#dna-b)" strokeWidth="4.5" strokeLinecap="round" />
            <path d={a} fill="none" stroke="url(#dna-a)" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        </svg>
      )}
    </div>
  );
}

/** Highlights the section currently being read in the “On this page” menus. */
export function SectionSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const links = () => Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-spy]"));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          links().forEach((l) => {
            const on = l.dataset.spy === e.target.id;
            l.toggleAttribute("data-on", on);
            if (on) l.setAttribute("aria-current", "location");
            else l.removeAttribute("aria-current");
            if (on && l.closest("[data-pills]")) l.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
          });
        }),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return null;
}

/**
 * A thin double helix in the left margin of the page, drawn as the visitor scrolls, with a gold knot
 * beside each section heading. Only on wide screens where there is empty margin.
 */
export function DnaThread({ startId }: { startId: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<{ top: number; left: number; h: number; knots: number[] } | null>(null);
  const [lim, setLim] = useState(0);

  useEffect(() => {
    const wrap = host.current?.parentElement;
    if (!wrap) return;
    const measure = () => {
      if (window.innerWidth < 1440) return setG(null);
      const start = document.getElementById(startId);
      const box = wrap.getBoundingClientRect();
      const container = document.querySelector<HTMLElement>(`#${startId} .container-x`) ?? start;
      if (!start || !container) return setG(null);
      const top = start.getBoundingClientRect().top - box.top;
      const h = box.height - top - 40;
      const left = Math.max(8, container.getBoundingClientRect().left - box.left - 40);
      const knots = Array.from(wrap.querySelectorAll("h2"))
        .map((el) => el.getBoundingClientRect().top - box.top - top + 18)
        .filter((y) => y > 0 && y < h);
      setG({ top, left, h, knots });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [startId]);

  useEffect(() => {
    if (!g) return;
    if (reduced()) return setLim(g.h);
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = host.current?.getBoundingClientRect();
      if (r) setLim(Math.max(0, Math.min(g.h, window.innerHeight * 0.7 - r.top)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [g]);

  const w = 64;
  const mid = w / 2;
  const amp = 19;
  let a = "";
  let b = "";
  const rungs: { y: number; x1: number; x2: number }[] = [];
  if (g) {
    const turns = Math.max(6, Math.round(g.h / 320));
    const N = Math.max(160, Math.round(g.h / 8));
    for (let i = 0; i <= N; i++) {
      const y = (g.h * i) / N;
      const t = (i / N) * turns * Math.PI * 2;
      a += `${i ? "L" : "M"}${(mid + Math.sin(t) * amp).toFixed(1)} ${y.toFixed(1)}`;
      b += `${i ? "L" : "M"}${(mid - Math.sin(t) * amp).toFixed(1)} ${y.toFixed(1)}`;
    }
    const R = turns * 4;
    for (let k = 1; k < R; k++) {
      const y = (g.h * k) / R;
      const t = (k / R) * turns * Math.PI * 2;
      rungs.push({ y, x1: mid + Math.sin(t) * amp, x2: mid - Math.sin(t) * amp });
    }
  }

  return (
    <div ref={host} aria-hidden="true" className="pointer-events-none absolute z-[1] hidden min-[1440px]:block" style={g ? { top: g.top, left: g.left, width: w, height: g.h } : { display: "none" }}>
      {g && (
        <svg width={w} height={g.h} className="overflow-visible">
          <defs>
            <linearGradient id="thr-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E7D4F" /><stop offset="1" stopColor="#72BF44" /></linearGradient>
            <linearGradient id="thr-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1F3D2B" /><stop offset="1" stopColor="#567459" /></linearGradient>
            <clipPath id="thr-clip"><rect x={-20} y={0} width={w + 40} height={lim} /></clipPath>
          </defs>
          <g clipPath="url(#thr-clip)">
            {rungs.map((r, i) => (
              <line key={i} x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} stroke="#C9A45C" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
            ))}
            <path d={b} fill="none" stroke="url(#thr-b)" strokeWidth="3" strokeLinecap="round" />
            <path d={a} fill="none" stroke="url(#thr-a)" strokeWidth="3" strokeLinecap="round" />
            {g.knots.map((y) => (
              <circle key={y} cx={mid} cy={y} r="6.5" fill="#C9A45C" stroke="#fff" strokeWidth="3" />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
