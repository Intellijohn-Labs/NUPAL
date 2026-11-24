"use client";

import { useState } from "react";
import { parseVideo, youtubeThumb } from "@/lib/video";

/**
 * Quality & Research → Kochi unit video. Shows the cover with a play button; the video (an uploaded file or
 * YouTube) only loads when the visitor taps play, so the page stays fast.
 */
export function UnitVideo({ url, poster, title }: { url: string; poster: string | null; title: string }) {
  const [playing, setPlaying] = useState(false);
  const v = parseVideo(url);
  if (!v) return null;
  const cover = poster || (v.kind === "youtube" ? youtubeThumb(v.id) : null);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[22px] bg-[#13442F] shadow-[0_24px_48px_-32px_rgba(23,77,54,.7)]">
      {playing ? (
        v.kind === "youtube" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <video src={v.url} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
        )
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 block w-full" aria-label={`Play video: ${title}`}>
          {cover ? (
             
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            // uploaded video without a cover: its first frame
            <video src={`${(v as { url: string }).url}#t=0.1`} preload="metadata" muted playsInline className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#174D36] shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)] transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 sm:h-8 sm:w-8" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
