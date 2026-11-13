"use client";

import { useEffect, useRef, useState } from "react";

export type Cert = { src: string; label: string };

/** Our Story → quality section: small labelled certificate cards that open full size. */
export function CertStrip({ certs }: { certs: Cert[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  if (!certs.length) return null;
  const c = open === null ? null : certs[open];
  return (
    <>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {certs.map((x, i) => (
          <li key={x.src} className="w-[118px] shrink-0 sm:w-auto">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${x.label}: view certificate full size`}
              className="group block w-full rounded-xl border border-[#E3DCCD] bg-white p-2 shadow-[0_10px_24px_-20px_rgba(23,77,54,.5)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_18px_32px_-22px_rgba(23,77,54,.6)]"
            >
              <span className="block aspect-[3/4] overflow-hidden rounded-lg bg-[#F4EBD2]">
                <img src={x.src} alt="" loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="mt-2 block text-center text-[13px] font-medium text-[#174D36]">{x.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92svh] w-[min(92vw,720px)] rounded-2xl bg-white p-0 backdrop:bg-black/70"
      >
        {c && (
          <figure className="m-0">
            <img src={c.src} alt={c.label} className="max-h-[80svh] w-full object-contain" />
            <figcaption className="flex items-center justify-between gap-3 border-t border-[#E3DCCD] px-4 py-3">
              <span className="font-medium text-[#174D36]">{c.label}</span>
              <button type="button" onClick={() => dialog.current?.close()} className="btn h-11 border border-[#E3DCCD] bg-white px-5 text-[#174D36] hover:border-[#174D36]">
                Close
              </button>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
