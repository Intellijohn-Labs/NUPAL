"use client";

import { useActionState } from "react";
import type { Page } from "@prisma/client";
import { savePage } from "@/app/admin/(panel)/pages/actions";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./ui";

export function PageForm({ page }: { page: Page | null }) {
  const [error, action] = useActionState(savePage.bind(null, page?.id ?? null), null);
  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
      <section className="a-card flex flex-col gap-4">
        <div><label htmlFor="title" className="a-label">Title</label><input id="title" name="title" required defaultValue={page?.title} className="a-input" /></div>
        <div>
          <label htmlFor="content" className="a-label">Content</label>
          <textarea id="content" name="content" rows={20} defaultValue={page?.content} className="a-textarea font-mono text-sm leading-6" />
          <p className="a-help">Start a line with ## for a heading, - for a bullet. Leave a blank line between paragraphs. **bold**, [link text](https://…).</p>
        </div>
      </section>
      <section className="a-card flex flex-col gap-3">
        <div><label htmlFor="slug" className="a-label">Web address</label><input id="slug" name="slug" defaultValue={page?.slug} placeholder="Made from the title" className="a-input" /></div>
        <div><label htmlFor="seoDesc" className="a-label">Search description</label><textarea id="seoDesc" name="seoDesc" rows={3} defaultValue={page?.seoDesc ?? ""} className="a-textarea" /></div>
        <label className="flex items-center gap-3 text-[15px]"><input type="checkbox" name="published" defaultChecked={page?.published ?? true} className="h-5 w-5 accent-[#2e6b47]" />Published</label>
        <label className="flex items-center gap-3 text-[15px]"><input type="checkbox" name="inFooter" defaultChecked={page?.inFooter ?? true} className="h-5 w-5 accent-[#2e6b47]" />Link in footer</label>
        <div className="border-t border-[#e8eeea] pt-3">
          <p className="a-label">Header background (optional)</p>
          <ImageField name="headerImage" folder="pages" maxSide={2400} multiple={false} existing={page?.headerImage ? [page.headerImage] : []} help="A wide photo, at least 1920 × 600 px. Leave empty for the plain header." />
        </div>
        {error && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
        <SubmitButton className="a-btn h-11">Save page</SubmitButton>
      </section>
    </form>
  );
}
