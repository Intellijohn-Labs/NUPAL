"use client";

import { useEffect, useRef, useState } from "react";

type Person = {
  name: string;
  qual?: string;
  role?: string;
  bio: string;
  photo?: string | null;
  initials: string;
};

/** "Read more" link on a team card. Opens a forest-green modal with the person's photo and full bio. */
export function PersonModal({ person }: { person: Person }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    // keep the page behind from scrolling while the modal is open
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => dialog.current?.close();
  const paras = person.bio
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="mx-auto mt-auto flex min-h-11 items-center gap-1 pt-2 text-[13.5px] font-medium text-[#397C42] hover:text-[#174D36]"
      >
        Read more
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
        <span className="sr-only"> about {person.name}</span>
      </button>

      <dialog
        ref={dialog}
        aria-label={person.name}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto max-h-[92svh] w-[min(94vw,880px)] overflow-hidden rounded-[26px] bg-[#174D36] p-0 text-left text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] backdrop:bg-[#0B2A1D]/75 backdrop:backdrop-blur-[2px]"
      >
        {open && (
          <div className="relative">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/25 text-white transition-colors hover:bg-white hover:text-[#174D36]"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            {/* phones: the whole modal scrolls; wider screens: only the text column scrolls */}
            <div className="grid max-h-[92svh] overflow-y-auto overscroll-contain md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:overflow-hidden">
              {/* photo: a band on top on phones, a full-height column on wider screens */}
              <div className="relative h-[min(46svh,340px)] bg-[linear-gradient(180deg,#2E7D4F,#123D2A)] md:h-auto">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                ) : (
                  <span className="grid h-full place-items-center font-display text-6xl text-white/90">
                    {person.initials}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#174D36] to-transparent md:inset-y-0 md:left-auto md:h-auto md:w-10 md:bg-gradient-to-l"
                />
              </div>

              <div className="px-6 pb-8 pt-5 sm:px-9 md:max-h-[92svh] md:overflow-y-auto md:overscroll-contain md:py-10">
                <h2 className="pr-10 font-display text-[clamp(26px,3vw,34px)] font-semibold leading-tight">
                  {person.name}
                </h2>
                {person.qual && (
                  <p className="mt-1 text-[15px] font-medium text-[#E2C77A]">
                    {person.qual}
                  </p>
                )}
                {person.role && (
                  <p className="mt-2 text-[14.5px] leading-6 text-[#CFE3C8]">
                    {person.role}
                  </p>
                )}
                <span
                  aria-hidden="true"
                  className="mt-5 block h-[2px] w-14 rounded-full bg-[#E2C77A]"
                />
                <div className="mt-5 grid gap-4 text-[15.5px] leading-7 text-white/90">
                  {paras.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
