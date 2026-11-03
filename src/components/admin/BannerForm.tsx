"use client";

import { useState } from "react";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./ui";

type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageDesktop: string | null;
  imageMobile: string | null;
  theme: string;
  active: boolean;
  sortOrder: number;
};

export function BannerForm({ b, next, action }: { b?: Banner; next: number; action: (f: FormData) => Promise<void> }) {
  const [kind, setKind] = useState<"image" | "text">(b && !b.imageDesktop ? "text" : "image");
  const id = b?.id ?? "new";

  return (
    <form action={action} className="flex flex-col gap-5">
      <fieldset>
        <legend className="a-label">Banner type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["image", "Image banner", "Upload your own designed banner. The image is shown as it is."],
            ["text", "Text banner", "Type a headline and button. The website designs it on a coloured background."],
          ].map(([k, t, d]) => (
            <label key={k} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 ${kind === k ? "border-[#2e6b47] bg-[#f3f8f4]" : "border-[#dce5df]"}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k as "image" | "text")} className="mt-1 accent-[#2e6b47]" />
              <span>
                <span className="block font-semibold">{t}</span>
                <span className="text-sm text-[#56685d]">{d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {kind === "image" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="a-label">Desktop image</p>
            <ImageField name="desktop" folder="banners" maxSide={2200} multiple={false} existing={b?.imageDesktop ? [b.imageDesktop] : []} help="Wide, about 1920 × 720 px" />
          </div>
          <div>
            <p className="a-label">Mobile image (recommended)</p>
            <ImageField name="mobile" folder="banners" maxSide={1600} multiple={false} existing={b?.imageMobile ? [b.imageMobile] : []} help="Tall, about 1080 × 1350 px. Without it, phones show the desktop image smaller." />
          </div>
          <div>
            <label htmlFor={`t-${id}`} className="a-label">Describe the image</label>
            <input id={`t-${id}`} name="title" required defaultValue={b?.title} placeholder="e.g. Kamilari capsules for liver protection" className="a-input" />
            <p className="a-help">Not shown on the banner. Read aloud to blind visitors and used by Google.</p>
          </div>
          <div>
            <label htmlFor={`ch-${id}`} className="a-label">Opens when tapped</label>
            <input id={`ch-${id}`} name="ctaHref" defaultValue={b?.ctaHref ?? "/shop"} placeholder="/product/kamilari-capsules" className="a-input" />
            <p className="a-help">A page on the website, e.g. /shop, /consult or /concern/liver-health.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div><label htmlFor={`e-${id}`} className="a-label">Small line above the headline (optional)</label><input id={`e-${id}`} name="eyebrow" defaultValue={b?.eyebrow} placeholder="e.g. Generations of Ayurvedic care · Kochi" className="a-input" /></div>
            <div><label htmlFor={`t-${id}`} className="a-label">Headline</label><textarea id={`t-${id}`} name="title" required rows={2} defaultValue={b?.title} className="a-textarea" /><p className="a-help">The last line is shown in gold on the green background — use a line break (Enter) to choose where it starts.</p></div>
            <div><label htmlFor={`s-${id}`} className="a-label">Supporting text</label><textarea id={`s-${id}`} name="subtitle" rows={3} defaultValue={b?.subtitle} className="a-textarea" /></div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor={`cl-${id}`} className="a-label">Button text</label><input id={`cl-${id}`} name="ctaLabel" defaultValue={b?.ctaLabel ?? "Shop now"} className="a-input" /></div>
              <div><label htmlFor={`ch-${id}`} className="a-label">Button link</label><input id={`ch-${id}`} name="ctaHref" defaultValue={b?.ctaHref ?? "/shop"} className="a-input" /></div>
            </div>
            <div>
              <label htmlFor={`th-${id}`} className="a-label">Background colour</label>
              <select id={`th-${id}`} name="theme" defaultValue={b?.theme ?? "cream"} className="a-input">
                <option value="cream">Cream</option><option value="green">Deep green</option><option value="brown">Sand</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-28"><label htmlFor={`o-${id}`} className="a-label">Order</label><input id={`o-${id}`} name="sortOrder" inputMode="numeric" defaultValue={b?.sortOrder ?? next} className="a-input" /></div>
        <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={b?.active ?? true} className="h-5 w-5 accent-[#2e6b47]" />Show on homepage</label>
        <SubmitButton>{b ? "Save banner" : "Add banner"}</SubmitButton>
      </div>
    </form>
  );
}
