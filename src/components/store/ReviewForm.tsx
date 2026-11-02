"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/(store)/product/[slug]/actions";

export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  if (done)
    return <p role="status" className="rounded-2xl bg-mist p-5 text-[15px]">Thank you for your valuable review! We truly appreciate you taking the time to share your experience.</p>;
  if (!open)
    return <button type="button" className="btn-outline" onClick={() => setOpen(true)}>Write a review</button>;

  function submit(f: FormData) {
    setError("");
    const g = (k: string) => String(f.get(k) ?? "");
    start(async () => {
      const res = await submitReview({
        productId,
        rating,
        name: g("name"),
        place: g("place"),
        phone: g("phone").replace(/\D/g, "").slice(-10),
        title: g("title"),
        body: g("body"),
        website: g("website"),
      });
      if (!res.ok) return setError(res.error);
      setDone(true);
    });
  }

  return (
    <form action={submit} className="fade-in flex flex-col gap-4 rounded-2xl border border-line p-5">
      <p className="font-display text-xl">Review {productName}</p>
      <fieldset>
        <legend className="label mb-2">Your rating</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
              <span className="sr-only">{n} star{n > 1 ? "s" : ""} – {labels[n]}</span>
              <svg width="34" height="34" viewBox="0 0 24 24" fill={(hover || rating) >= n ? "#C9A45C" : "#E3DCCD"} aria-hidden="true" className="transition-transform hover:scale-110">
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
              </svg>
            </label>
          ))}
          <span className="ml-2 text-sm text-muted">{labels[hover || rating]}</span>
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5"><label htmlFor="r-name" className="label">Your name</label><input id="r-name" name="name" required autoComplete="name" className="field" /></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="r-place" className="label">Town <span className="font-normal text-muted">(optional)</span></label><input id="r-place" name="place" autoComplete="address-level2" className="field" /></div>
      </div>
      <div className="flex flex-col gap-1.5"><label htmlFor="r-title" className="label">Headline <span className="font-normal text-muted">(optional)</span></label><input id="r-title" name="title" maxLength={80} className="field" /></div>
      <div className="flex flex-col gap-1.5"><label htmlFor="r-body" className="label">Your review</label><textarea id="r-body" name="body" required rows={4} className="field h-auto py-3" placeholder="How did it help you? How long have you used it?" /></div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="r-phone" className="label">Mobile number <span className="font-normal text-muted">(optional, never shown)</span></label>
        <input id="r-phone" name="phone" inputMode="numeric" autoComplete="tel-national" className="field" />
        <p className="text-sm text-muted">If you bought this from us, your review gets a “Verified buyer” badge.</p>
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px]"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
      <div className="flex gap-3">
        <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn-primary flex-1" disabled={pending || !rating}>{pending ? "Sending…" : "Submit review"}</button>
      </div>
    </form>
  );
}
