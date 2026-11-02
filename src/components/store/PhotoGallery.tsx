"use client";

import { useEffect, useRef, useState } from "react";

/** Photo grid; tap to view full size, with next/previous, swipe and arrow keys. */
export function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length));

  useEffect(() => {
    if (open === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!images.length) return null;
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <li key={src}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`${title}: view photo ${i + 1} full size`} className="group block w-full overflow-hidden rounded-xl border border-line bg-white">
              <img src={src} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-label={`${title} photo`}
        className="m-auto w-[min(94vw,1000px)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/85"
      >
        {open !== null && (
          <div
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="mb-3 flex items-center justify-between text-white">
              <span>{open + 1} of {images.length}</span>
              <button type="button" onClick={() => dialog.current?.close()} className="h-10 rounded-full bg-white px-4 text-sm font-medium text-forest">Close ✕</button>
            </div>
            <img src={images[open]} alt={`${title}, photo ${open + 1}`} className="max-h-[80vh] w-full rounded-2xl bg-black object-contain" />
            {images.length > 1 && (
              <div className="mt-3 flex justify-center gap-3">
                <button type="button" onClick={() => go(-1)} className="h-11 rounded-full bg-white/15 px-5 text-white hover:bg-white/25">← Previous</button>
                <button type="button" onClick={() => go(1)} className="h-11 rounded-full bg-white/15 px-5 text-white hover:bg-white/25">Next →</button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
