"use client";

import { useState } from "react";
import { getVideoUploadTarget } from "@/app/admin/upload-actions";
import { MAX_VIDEO_MB, parseVideo } from "@/lib/video";

/**
 * One video: upload a file (sent straight to Supabase Storage, with a progress bar) or paste a YouTube link.
 * The chosen address is posted as `name`.
 */
export function VideoField({ name, initial = "" }: { name: string; initial?: string }) {
  const [url, setUrl] = useState(initial);
  const [pct, setPct] = useState<number | null>(null);
  const [error, setError] = useState("");
  const v = parseVideo(url);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    const t = await getVideoUploadTarget(file.type, file.size);
    if ("error" in t) return setError(t.error);
    setPct(0);
    const body = new FormData();
    body.append("cacheControl", "31536000");
    body.append("", file, file.name);
    // XMLHttpRequest (not fetch) so the upload can show its progress
    const ok = await new Promise<boolean>((resolve) => {
      const x = new XMLHttpRequest();
      x.open("PUT", t.uploadUrl);
      x.setRequestHeader("x-upsert", "false");
      x.upload.onprogress = (e) => e.lengthComputable && setPct(Math.round((e.loaded / e.total) * 100));
      x.onload = () => resolve(x.status >= 200 && x.status < 300);
      x.onerror = () => resolve(false);
      x.send(body);
    });
    setPct(null);
    if (ok) setUrl(t.publicUrl);
    else setError("The upload failed. Check your connection and try again.");
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={url} />
      {v?.kind === "file" && <video src={v.url} controls preload="metadata" className="aspect-video w-full max-w-md rounded-xl bg-black" />}
      {v?.kind === "youtube" && (
         
        <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="YouTube video" className="aspect-video w-full max-w-md rounded-xl object-cover" />
      )}
      <label className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm ${pct !== null ? "border-[#dce5df] bg-[#f4f6f5]" : "cursor-pointer border-[#b9c6be] bg-[#fafcfb] hover:border-[#2e6b47]"}`}>
        <span className="font-semibold text-[#2e6b47]">{pct !== null ? `Uploading… ${pct}%` : url ? "Replace video" : "Choose a video to upload"}</span>
        <span className="text-[#56685d]">MP4, WebM or MOV, up to {MAX_VIDEO_MB} MB. A 1–2 minute clip works best.</span>
        {pct !== null && (
          <span className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[#dce5df]">
            <span className="block h-full bg-[#2e6b47] transition-[width]" style={{ width: `${pct}%` }} />
          </span>
        )}
        <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={pct !== null} className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      <div>
        <label className="a-label">…or paste a YouTube link</label>
        <input value={v?.kind === "file" ? "" : url} onChange={(e) => setUrl(e.target.value.trim())} placeholder="https://www.youtube.com/watch?v=…" className="a-input" />
      </div>
      {url && (
        <button type="button" className="self-start text-sm font-semibold text-[#a3361f]" onClick={() => setUrl("")}>
          Remove video
        </button>
      )}
      {url && !v && <p className="text-sm text-[#a3361f]">This link isn’t a YouTube or video file link.</p>}
      {error && <p role="alert" className="text-sm text-[#a3361f]">{error}</p>}
      {pct !== null && <p className="a-help">Keep this page open until the upload finishes, then save the section.</p>}
    </div>
  );
}
