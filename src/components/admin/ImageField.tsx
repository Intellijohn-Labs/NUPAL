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
}: {
  name?: string;
  existing?: string[];
  multiple?: boolean;
  help?: string;
  folder?: string;
  maxSide?: number;
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
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setError("");
    setBusy((n) => n + files.length);
    const res = await uploadFiles(multiple ? files : files.slice(0, 1), folder, undefined, maxSide);
    setBusy((n) => Math.max(0, n - files.length));
    const urls = res.filter((r) => r.url).map((r) => r.url!);
    const failed = res.filter((r) => r.status === "failed");
    if (failed.length) setError(failed[0].error || "Some photos couldn’t be uploaded.");
    setKept((k) => (multiple ? [...k, ...urls] : urls.length ? [urls[0]] : k));
  }

  const move = (i: number, d: number) =>
    setKept((k) => {
      const n = [...k];
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

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
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#b9c6be] bg-[#fafcfb] px-4 py-6 text-center text-sm hover:border-[#2e6b47]">
        <span className="font-semibold text-[#2e6b47]">{busy ? `Uploading ${busy}…` : multiple ? "Choose images to upload" : kept.length ? "Replace image" : "Choose an image"}</span>
        <span className="text-[#56685d]">{help ?? "JPG, PNG or WebP. Large photos are shrunk automatically."}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          multiple={multiple}
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
