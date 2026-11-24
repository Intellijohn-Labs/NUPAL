"use client";

import { useState } from "react";
import { getPdfUploadTarget } from "@/app/admin/upload-actions";
import { MAX_PDF_MB } from "@/lib/video";

/** One PDF: upload a file (sent straight to Supabase Storage) or paste a link to one. The address is posted as `name`. */
export function PdfField({ name, initial = "" }: { name: string; initial?: string }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    const t = await getPdfUploadTarget(file.type, file.size);
    if ("error" in t) return setError(t.error);
    setBusy(true);
    const body = new FormData();
    body.append("cacheControl", "31536000");
    body.append("", file, file.name);
    const res = await fetch(t.uploadUrl, { method: "PUT", body, headers: { "x-upsert": "false" } }).catch(() => null);
    setBusy(false);
    if (res?.ok) setUrl(t.publicUrl);
    else setError("The upload failed. Check your connection and try again.");
  }

  const looksOk = !url || /^https?:\/\/\S+$/i.test(url);
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={url} />
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="self-start text-sm font-semibold text-[#2e6b47] underline">
          Open the current PDF
        </a>
      )}
      <label className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm ${busy ? "border-[#dce5df] bg-[#f4f6f5]" : "cursor-pointer border-[#b9c6be] bg-[#fafcfb] hover:border-[#2e6b47]"}`}>
        <span className="font-semibold text-[#2e6b47]">{busy ? "Uploading…" : url ? "Replace PDF" : "Choose a PDF to upload"}</span>
        <span className="text-[#56685d]">One PDF with all the certificates, up to {MAX_PDF_MB} MB.</span>
        <input type="file" accept="application/pdf" disabled={busy} className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      <div>
        <label className="a-label">…or paste a link to the PDF (e.g. a Supabase storage link)</label>
        <input value={url} onChange={(e) => setUrl(e.target.value.trim())} placeholder="https://….supabase.co/storage/v1/object/public/…/certificates.pdf" className="a-input" />
      </div>
      {!looksOk && <p className="text-sm text-[#a3361f]">This doesn’t look like a web link.</p>}
      {error && <p role="alert" className="text-sm text-[#a3361f]">{error}</p>}
      {busy && <p className="a-help">Keep this page open until the upload finishes, then save the section.</p>}
    </div>
  );
}
