"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFiles } from "@/lib/upload-client";

/**
 * Image picker that uploads straight away (compressed, directly to storage) and submits only URLs
 * with the form: one hidden `${name}_keep` input per image, in order.
 */
export function ImageField({
  name = "images",
  existing = [],
  multiple = true,
  help,
  folder = "misc",
  maxSide = 1600,
  square = false,
  trimBars = false,
  max,
}: {
  name?: string;
  existing?: string[];
  multiple?: boolean;
  help?: string;
  folder?: string;
  maxSide?: number;
  /** Trim white borders and centre on a square with padding (product photos). */
  square?: boolean;
  /** Cut off plain black/white bars at the edges (banners). */
  trimBars?: boolean;
  /** Most images allowed (multiple only). Picking more uploads only the first ones that fit. */
  max?: number;
}) {
  const [kept, setKept] = useState(existing);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Stop the form being saved while photos are still uploading.
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const block = (e: Event) => {
      if (busy > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setError("Please wait — photos are still uploading.");
      }
    };
    form.addEventListener("submit", block, true);
    return () => form.removeEventListener("submit", block, true);
  }, [busy]);

  async function onPick(list: FileList | null) {
    let files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setError("");
    if (multiple && max) {
      const room = max - kept.length - busy;
      if (room <= 0) {
        setError(`You can add up to ${max} images. Remove one to add another.`);
        return;
      }
      if (files.length > room) {
        files = files.slice(0, room);
        setError(`You can add up to ${max} images, so only the first ${room} ${room === 1 ? "was" : "were"} added.`);
      }
    }
    setBusy((n) => n + files.length);
    const res = await uploadFiles(multiple ? files : files.slice(0, 1), folder, undefined, { maxSide, square, trimBars });
    setBusy((n) => Math.max(0, n - files.length));
    const urls = res.filter((r) => r.url).map((r) => r.url!);
    const failed = res.filter((r) => r.status === "failed");
    if (failed.length) setError(failed[0].error || "Some photos couldn’t be uploaded.");
    setKept((k) => (multiple ? [...k, ...urls].slice(0, max ?? Infinity) : urls.length ? [urls[0]] : k));
  }

  const move = (i: number, d: number) =>
    setKept((k) => {
      const n = [...k];
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const full = multiple && !!max && kept.length + busy >= max;

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {kept.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {kept.map((src, i) => (
            <li key={src} className="relative w-28">
              <input type="hidden" name={`${name}_keep`} value={src} />
              <img src={src} alt="" className="h-28 w-28 rounded-xl border border-[#dce5df] object-cover" />
              {i === 0 && multiple && <span className="absolute left-1.5 top-1.5 rounded bg-white px-1.5 text-[11px] font-bold">Cover</span>}
              <div className="mt-1 flex justify-between text-xs">
                {multiple && (
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} aria-label="Move left" className="rounded border border-[#dce5df] px-1.5">←</button>
                    <button type="button" onClick={() => move(i, 1)} aria-label="Move right" className="rounded border border-[#dce5df] px-1.5">→</button>
                  </span>
                )}
                <button type="button" onClick={() => setKept((k) => k.filter((x) => x !== src))} className="font-semibold text-[#a3361f]">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm ${full ? "cursor-not-allowed border-[#dce5df] bg-[#f4f6f5]" : "cursor-pointer border-[#b9c6be] bg-[#fafcfb] hover:border-[#2e6b47]"}`}>
        <span className={`font-semibold ${full ? "text-[#56685d]" : "text-[#2e6b47]"}`}>
          {busy
            ? `Uploading ${busy}…`
            : full
              ? `Limit reached: ${max} of ${max}. Remove one to add another.`
              : multiple
                ? max
                  ? `Choose images to upload (${kept.length} of ${max})`
                  : "Choose images to upload"
                : kept.length
                  ? "Replace image"
                  : "Choose an image"}
        </span>
        <span className="text-[#56685d]">{help ?? "JPG, PNG or WebP. Large photos are shrunk automatically."}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          multiple={multiple}
          disabled={full}
          className="sr-only"
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && <p role="alert" className="text-sm text-[#a3361f]">{error}</p>}
    </div>
  );
}
