"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

export type ResultItem = { id: string; patientId: string; beforeUrl: string | null; afterUrl: string | null; imageUrl: string | null };

function Shield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 text-sage">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function Card({ r, onOpen }: { r: ResultItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View result for patient ${r.patientId} full screen`}
      className="group block w-full overflow-hidden rounded-2xl border border-line bg-white text-left transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-24px_rgba(31,61,43,.6)]"
    >
      {r.imageUrl ? (
        <span className="block aspect-[2/1] bg-cream">
          <img src={r.imageUrl} alt={`Before and after, patient ${r.patientId}`} loading="lazy" className="h-full w-full object-contain" />
        </span>
      ) : (
        <span className="grid grid-cols-2 gap-[3px] bg-line">
          <span className="relative block">
            <img src={r.beforeUrl!} alt={`Before, patient ${r.patientId}`} loading="lazy" className="aspect-square w-full object-cover" />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-medium text-forest">Before</span>
          </span>
          <span className="relative block">
            <img src={r.afterUrl!} alt={`After, patient ${r.patientId}`} loading="lazy" className="aspect-square w-full object-cover" />
            <span className="absolute bottom-2 left-2 rounded-full bg-forest px-2.5 py-0.5 text-xs font-medium text-white">After</span>
          </span>
        </span>
      )}
      <span className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-ink">
        <Shield />
        Patient ID · {r.patientId}
      </span>
    </button>
  );
}

/** Grid of results + full-screen viewer with next/previous, swipe and arrow keys. */
export function ResultsGallery({ items, step, className = "", layout = "grid" }: { items: ResultItem[]; step?: number; className?: string; layout?: "grid" | "home" }) {
  const [shown, setShown] = useState(step ?? items.length);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const list = items.slice(0, shown);

  useEffect(() => {
    if (open === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  const close = () => {
    dialog.current?.close();
    setOpen(null);
  };
  const cur = open !== null ? items[open] : null;

  const grid =
    layout === "home"
      ? "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  const cell = layout === "home" ? "w-[84vw] max-w-[360px] shrink-0 snap-center sm:w-auto sm:max-w-none" : "";

  return (
    <div className={className}>
      <ul className={grid}>
        {list.map((r, i) => (
          <li key={r.id} className={cell}>
            <Reveal index={i % 3} from="zoom">
              <Card r={r} onOpen={() => setOpen(i)} />
            </Reveal>
          </li>
        ))}
      </ul>
      {step && items.length > shown && (
        <div className="mt-10 text-center">
          <button type="button" className="btn-outline" onClick={() => setShown((n) => n + step)}>
            Show more results ({items.length - shown} more)
          </button>
        </div>
      )}

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && close()}
        aria-label={cur ? `Result for patient ${cur.patientId}` : "Result"}
        className="m-auto w-[min(94vw,1000px)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/85"
      >
        {cur && (
          <div
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) setOpen((i) => (i === null ? i : dx < 0 ? (i + 1) % items.length : (i - 1 + items.length) % items.length));
              touchX.current = null;
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <span className="flex items-center gap-2 text-[15px]">Patient ID · {cur.patientId}<span className="text-white/60">({(open ?? 0) + 1} of {items.length})</span></span>
              <button type="button" onClick={close} className="h-10 rounded-full bg-white px-4 text-sm font-medium text-forest">Close ✕</button>
            </div>
            {cur.imageUrl ? (
              <img src={cur.imageUrl} alt={`Before and after, patient ${cur.patientId}`} className="max-h-[78vh] w-full rounded-2xl bg-black object-contain" />
            ) : (
              <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
                <figure className="relative m-0"><img src={cur.beforeUrl!} alt={`Before, patient ${cur.patientId}`} className="aspect-square max-h-[78vh] w-full object-cover" /><figcaption className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-sm font-medium text-forest">Before</figcaption></figure>
                <figure className="relative m-0"><img src={cur.afterUrl!} alt={`After, patient ${cur.patientId}`} className="aspect-square max-h-[78vh] w-full object-cover" /><figcaption className="absolute bottom-3 left-3 rounded-full bg-forest px-3 py-1 text-sm font-medium text-white">After</figcaption></figure>
              </div>
            )}
            {items.length > 1 && (
              <div className="mt-3 flex justify-center gap-3">
                <button type="button" aria-label="Previous result" onClick={() => setOpen((i) => ((i ?? 0) - 1 + items.length) % items.length)} className="h-11 rounded-full bg-white/15 px-5 text-white hover:bg-white/25">← Previous</button>
                <button type="button" aria-label="Next result" onClick={() => setOpen((i) => ((i ?? 0) + 1) % items.length)} className="h-11 rounded-full bg-white/15 px-5 text-white hover:bg-white/25">Next →</button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
