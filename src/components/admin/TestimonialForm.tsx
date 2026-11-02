"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveTestimonial } from "@/app/admin/(panel)/testimonials/actions";
import { parseVideo, youtubeThumb } from "@/lib/video";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./ui";

type T = { id: string; name: string; place: string; quote: string; videoUrl: string; thumbnail: string | null; productId: string | null; active: boolean; sortOrder: number };

export function TestimonialForm({ t, products, next = 0 }: { t?: T; products: { id: string; name: string }[]; next?: number }) {
  const [msg, action] = useActionState(saveTestimonial.bind(null, t?.id ?? null), null);
  const [url, setUrl] = useState(t?.videoUrl ?? "");
  const ref = useRef<HTMLFormElement>(null);
  const v = parseVideo(url);
  const id = t?.id ?? "new";

  useEffect(() => {
    if (msg === "OK" && !t) {
      ref.current?.reset();
      setUrl("");
    }
  }, [msg, t]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-3">
      <div>
        <label htmlFor={`v-${id}`} className="a-label">Video link</label>
        <input id={`v-${id}`} name="videoUrl" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="a-input" />
        <p className="a-help">YouTube video (can be “Unlisted”). Videos are shown in landscape (wide) shape. Big video files are best uploaded to YouTube — it streams faster on phones.</p>
        {url && !v && <p className="mt-1 text-sm text-[#a3361f]">This doesn’t look like a YouTube or .mp4 link.</p>}
        {v?.kind === "youtube" && <img src={youtubeThumb(v.id)} alt="Video preview" className="mt-2 h-24 rounded-lg" />}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label htmlFor={`n-${id}`} className="a-label">Customer name</label><input id={`n-${id}`} name="name" required defaultValue={t?.name} className="a-input" /></div>
        <div><label htmlFor={`p-${id}`} className="a-label">Town (optional)</label><input id={`p-${id}`} name="place" defaultValue={t?.place} className="a-input" /></div>
      </div>
      <div><label htmlFor={`q-${id}`} className="a-label">Short quote (optional)</label><input id={`q-${id}`} name="quote" maxLength={140} defaultValue={t?.quote} placeholder="Shown when visitors tap the i button" className="a-input" /></div>
      <div>
        <div>
          <label htmlFor={`pr-${id}`} className="a-label">Product (optional)</label>
          <select id={`pr-${id}`} name="productId" defaultValue={t?.productId ?? ""} className="a-input">
            <option value="">—</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div><p className="a-label">Cover image (optional)</p><ImageField name="thumb" folder="testimonials" multiple={false} existing={t?.thumbnail ? [t.thumbnail] : []} help="YouTube’s own thumbnail is used if empty" /></div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-24"><label htmlFor={`o-${id}`} className="a-label">Order</label><input id={`o-${id}`} name="sortOrder" inputMode="numeric" defaultValue={t?.sortOrder ?? next} className="a-input" /></div>
        <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={t?.active ?? true} className="h-5 w-5 accent-[#2e6b47]" />Show on homepage</label>
      </div>
      {msg && msg !== "OK" && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{msg}</p>}
      {msg === "OK" && <p role="status" className="rounded-lg bg-[#ddf0e3] px-3 py-2 text-sm text-[#1e5a36]">Saved.</p>}
      <SubmitButton>{t ? "Save" : "Add video"}</SubmitButton>
    </form>
  );
}
