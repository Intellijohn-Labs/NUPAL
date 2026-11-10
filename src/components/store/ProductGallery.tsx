"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { parseVideo, youtubeThumb } from "@/lib/video";
import { ProductArt } from "./ProductArt";

const PLAY = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#1F3D2B" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);

export function ProductGallery({ images, name, type, videoUrl }: { images: string[]; name: string; type: string; videoUrl?: string | null }) {
  const video = videoUrl ? parseVideo(videoUrl) : null;
  const videoThumb = video?.kind === "youtube" ? youtubeThumb(video.id) : null;
  const slots = images.length + (video ? 1 : 0);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const isVideo = !!video && i === images.length;

  const openVideo = () => {
    setPlaying(true);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    setPlaying(false);
  };

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {slots > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-col">
          {images.map((src, k) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${k + 1}`}
              aria-pressed={k === i}
              onClick={() => setI(k)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${k === i ? "border-sage" : "border-transparent"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="bg-white object-contain p-1" />
            </button>
          ))}
          {video && (
            <button
              type="button"
              aria-label="Show product video"
              aria-pressed={isVideo}
              onClick={() => setI(images.length)}
              className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-forest ${isVideo ? "border-sage" : "border-transparent"}`}
            >
              {videoThumb && <img src={videoThumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/95">{PLAY}</span>
            </button>
          )}
        </div>
      )}

      <div className="relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-3xl bg-white">
        {isVideo || (!images.length && video && slots === 1) ? (
          <button type="button" onClick={openVideo} aria-label={`Play ${name} video`} className="group absolute inset-0 flex items-center justify-center bg-forest">
            {videoThumb && <img src={videoThumb} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            <span className="absolute inset-0 bg-black/20" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">{PLAY}</span>
            <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-sm font-medium text-forest">Watch video</span>
          </button>
        ) : images[i] ? (
          <Image src={images[i]} alt={name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="bg-white object-contain p-6" />
        ) : (
          <ProductArt name={name} type={type} size={200} />
        )}
      </div>

      {video && (
        <dialog
          ref={dialog}
          onClose={() => setPlaying(false)}
          onClick={(e) => e.target === dialog.current && close()}
          aria-label={`${name} video`}
          className="m-auto overflow-visible bg-transparent p-0 backdrop:bg-black/80"
        >
          {playing && (
            <div className="relative">
              <button type="button" onClick={close} className="absolute -top-12 right-0 h-10 rounded-full bg-white px-4 text-sm font-medium">Close ✕</button>
              <div className="aspect-video w-[min(94vw,960px)] overflow-hidden rounded-2xl bg-black">
                {video.kind === "youtube" ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
                    title={`${name} video`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <video src={video.url} controls autoPlay playsInline className="h-full w-full" />
                )}
              </div>
            </div>
          )}
        </dialog>
      )}
    </div>
  );
}
