"use client";

import { useRef, useState } from "react";
import { parseVideo, youtubeThumb } from "@/lib/video";

/** One large customer video card; plays in a pop-up. */
export function FeaturedVideo({ name, place, quote, videoUrl, thumbnail }: { name: string; place: string; quote: string; videoUrl: string; thumbnail: string | null }) {
  const v = parseVideo(videoUrl);
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(false);
  if (!v) return null;
  const cover = thumbnail ?? (v.kind === "youtube" ? youtubeThumb(v.id) : null);
  const close = () => {
    dialog.current?.close();
    setPlaying(false);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPlaying(true);
          dialog.current?.showModal();
        }}
        aria-label={`Play ${name}’s story`}
        className="group relative flex h-full min-h-[230px] w-full flex-col justify-end overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#2E5A3F,#1F3D2B)] p-6 text-left text-white sm:min-h-[320px]"
      >
        {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />}
        <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(15,30,20,.85),rgba(15,30,20,.1)_60%)]" />
        <span className="absolute left-1/2 top-[42%] flex h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-[0_12px_28px_-12px_rgba(0,0,0,.5)] transition-transform group-hover:scale-110">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#1F3D2B" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </span>
        <span className="relative text-xs uppercase tracking-[.14em] text-gold">Customer experience</span>
        <span className="relative font-display text-[24px] leading-tight sm:text-[26px]">Hear Their Story</span>
        {(quote || name) && (
          <span className="relative mt-1 text-sm text-white/85">
            {quote ? `“${quote}” — ` : ""}
            {name}
            {place ? `, ${place}` : ""}
          </span>
        )}
      </button>
      <dialog ref={dialog} onClose={() => setPlaying(false)} onClick={(e) => e.target === dialog.current && close()} aria-label={`${name}’s story`} className="m-auto overflow-visible bg-transparent p-0 backdrop:bg-black/80">
        {playing && (
          <div className="relative">
            <button type="button" onClick={close} className="absolute -top-12 right-0 h-10 rounded-full bg-white px-4 text-sm font-medium">Close ✕</button>
            <div className="aspect-video w-[min(94vw,960px)] overflow-hidden rounded-2xl bg-black">
              {v.kind === "youtube" ? (
                <iframe src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`} title={`${name}’s story`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full" />
              ) : (
                <video src={v.url} controls autoPlay playsInline className="h-full w-full" />
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
