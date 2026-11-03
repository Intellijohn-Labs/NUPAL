"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { parseVideo, youtubeThumb } from "@/lib/video";
import { Reveal } from "./Reveal";

export type VideoItem = { id: string; name: string; place: string; quote: string; videoUrl: string; thumbnail: string | null; vertical: boolean; product: { name: string; slug: string } | null };

function VideoCard({ t, onPlay }: { t: VideoItem; onPlay: () => void }) {
  const [info, setInfo] = useState(false);
  const p = parseVideo(t.videoUrl)!;
  const cover = t.thumbnail || (p.kind === "youtube" ? youtubeThumb(p.id) : null);
  const hasInfo = !!(t.name || t.place || t.quote || t.product);

  return (
    <figure className="group relative aspect-video overflow-hidden rounded-2xl bg-forest shadow-[0_20px_40px_-30px_rgba(35,64,46,.7)]">
      <button type="button" onClick={onPlay} className="absolute inset-0 block h-full w-full" aria-label={`Play ${t.name}’s video`}>
        {cover ? (
          // object-cover also trims the black bars YouTube adds to its thumbnails
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <video src={(p as { url: string }).url} preload="metadata" muted playsInline className="h-full w-full object-cover" />
        )}
        <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1F3D2B" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </button>

      {hasInfo && (
        <>
          <div
            id={`info-${t.id}`}
            className={`absolute inset-0 flex flex-col justify-end gap-1.5 bg-forest/90 p-5 pr-14 text-cream transition-opacity duration-300 ${info ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={!info}
          >
            {t.name && <p className="font-display text-xl leading-tight">{t.name}</p>}
            {t.place && <p className="text-sm text-[#c9d4c8]">{t.place}</p>}
            {t.quote && <p className="mt-1 line-clamp-3 text-[15px] leading-6">“{t.quote}”</p>}
            {t.product && (
              <Link href={`/product/${t.product.slug}`} tabIndex={info ? 0 : -1} className="mt-1 self-start text-sm font-medium text-gold hover:underline">
                {t.product.name} →
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setInfo((v) => !v)}
            aria-expanded={info}
            aria-controls={`info-${t.id}`}
            aria-label={info ? "Hide details" : `About ${t.name}’s video`}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 font-serif text-[15px] font-semibold italic text-forest shadow">
              {info ? "✕" : "i"}
            </span>
          </button>
        </>
      )}
    </figure>
  );
}

type Props = {
  items: VideoItem[];
  /** Homepage: show this many, then a “View all stories” link. Stories page: leave empty. */
  limit?: number;
  /** Stories page: show this many at first, then a “Show more” button. */
  step?: number;
  heading?: boolean;
};

export function VideoTestimonials({ items, limit, step, heading = true }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<VideoItem | null>(null);
  const [shown, setShown] = useState(step ?? Infinity);
  const all = items.filter((i) => parseVideo(i.videoUrl));
  if (!all.length) return null;
  const cap = limit ?? shown;
  const valid = all.slice(0, cap);

  const open = (i: VideoItem) => {
    setPlaying(i);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    setPlaying(null);
  };
  const v = playing ? parseVideo(playing.videoUrl) : null;

  return (
    <section aria-labelledby={heading ? "stories" : undefined} aria-label={heading ? undefined : "Customer videos"} className={`overflow-hidden ${heading ? "bg-white py-20 sm:py-24" : "pb-16"}`}>
      <div className="container-x">
        {heading && (
          <Reveal className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[.18em] text-sage">Customer stories</p>
            <h2 id="stories" className="mt-1.5 text-[clamp(30px,3.6vw,46px)] leading-tight">In their own words</h2>
          </Reveal>
        )}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {valid.map((t, i) => (
            <Reveal key={t.id} index={i % 3} from="zoom" className="w-[85vw] max-w-[420px] shrink-0 snap-center sm:w-auto sm:max-w-none">
              <VideoCard t={t} onPlay={() => open(t)} />
            </Reveal>
          ))}
        </div>
        {limit != null && all.length > limit && (
          <div className="mt-10 text-center">
            <Link href="/stories" className="btn-outline">View all stories ({all.length})</Link>
          </div>
        )}
        {limit == null && all.length > valid.length && (
          <div className="mt-10 text-center">
            <button type="button" className="btn-outline" onClick={() => setShown((n) => n + (step ?? 9))}>
              Show more stories ({all.length - valid.length} more)
            </button>
          </div>
        )}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setPlaying(null)}
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto overflow-visible bg-transparent p-0 backdrop:bg-black/80"
        aria-label={playing ? `${playing.name}’s video` : "Video"}
      >
        {playing && v && (
          <div className="relative">
            <button type="button" onClick={close} className="absolute -top-12 right-0 flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium">
              Close ✕
            </button>
            <div className="aspect-video w-[min(94vw,960px)] overflow-hidden rounded-2xl bg-black">
              {v.kind === "youtube" ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
                  title={`${playing.name}’s video`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <video src={v.url} controls autoPlay playsInline className="h-full w-full" />
              )}
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
