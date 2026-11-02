"use client";

import { useState } from "react";
import { saveBlock } from "@/app/admin/(panel)/pages/block-actions";
import { BLOCK_LABELS, type GalleryData, type Logo, type LogosData, type MessageData, type PeopleData, type Person, type TextData } from "@/lib/blocks";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./ui";

type Block = { id: string; type: string; title: string; anchor: string; data: unknown };

let seq = 0;
const key = () => `k${Date.now().toString(36)}${seq++}`;

export function BlockEditor({ block, pageSlug }: { block: Block; pageSlug: string }) {
  const d = (block.data ?? {}) as Record<string, unknown>;
  const label = BLOCK_LABELS[block.type]?.name ?? block.type;

  return (
    <form action={saveBlock.bind(null, block.id)} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label htmlFor={`t-${block.id}`} className="a-label">Section title</label>
          <input id={`t-${block.id}`} name="title" defaultValue={block.title} placeholder={block.type === "text" ? "e.g. About NUPAL (optional)" : ""} className="a-input" />
        </div>
        {block.anchor && <p className="a-help pb-3">Link to this section: <code>/{pageSlug}#{block.anchor}</code></p>}
      </div>

      {block.type === "text" && <TextFields d={d as TextData} />}
      {block.type === "message" && <MessageFields d={d as MessageData} />}
      {block.type === "people" && <Rows kind="people" initial={((d as PeopleData).people ?? []) as Person[]} />}
      {block.type === "logos" && <Rows kind="logos" initial={((d as LogosData).logos ?? []) as Logo[]} />}
      {block.type === "gallery" && (
        <div>
          <p className="a-label">Photos</p>
          <ImageField name="images" folder="pages" maxSide={2000} existing={(d as GalleryData).images ?? []} help="Certificates or event photos. Visitors can tap to see them full size." />
        </div>
      )}
      <div><SubmitButton>Save {label.toLowerCase()} section</SubmitButton></div>
    </form>
  );
}

const MD_HELP = "Leave a blank line between paragraphs. **bold**, - bullet points, [link text](https://…).";

function TextFields({ d }: { d: TextData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <label className="a-label" htmlFor="body">Text</label>
        <textarea name="body" rows={10} defaultValue={d.body ?? ""} className="a-textarea" />
        <p className="a-help">{MD_HELP}</p>
      </div>
      <div className="flex flex-col gap-3">
        <div><p className="a-label">Photo (optional)</p><ImageField name="image" folder="pages" multiple={false} existing={d.image ? [d.image] : []} /></div>
        <div>
          <label className="a-label">Photo position</label>
          <select name="imageSide" defaultValue={d.imageSide ?? "right"} className="a-input"><option value="right">Right of the text</option><option value="left">Left of the text</option></select>
        </div>
      </div>
    </div>
  );
}

function MessageFields({ d }: { d: MessageData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <div className="flex flex-col gap-3">
        <div><p className="a-label">Photo</p><ImageField name="photo" folder="pages" multiple={false} existing={d.photo ? [d.photo] : []} help="Portrait photo" /></div>
        <div><label className="a-label">Name</label><input name="name" defaultValue={d.name ?? ""} className="a-input" /></div>
        <div><label className="a-label">Role</label><input name="role" defaultValue={d.role ?? ""} placeholder="e.g. Chairman" className="a-input" /></div>
      </div>
      <div>
        <label className="a-label">Message</label>
        <textarea name="body" rows={14} defaultValue={d.body ?? ""} className="a-textarea" />
        <p className="a-help">{MD_HELP}</p>
      </div>
    </div>
  );
}

type Row = { k: string; name: string; role?: string; bio?: string; url?: string; img?: string | null };

function Rows({ kind, initial }: { kind: "people" | "logos"; initial: (Person | Logo)[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((r) =>
      kind === "people"
        ? { k: key(), name: r.name, role: (r as Person).role, bio: (r as Person).bio, img: (r as Person).photo ?? null }
        : { k: key(), name: r.name, url: (r as Logo).url, img: (r as Logo).image ?? null },
    ),
  );
  const move = (i: number, d: number) =>
    setRows((x) => {
      const n = [...x];
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <div key={r.k} className="grid gap-3 rounded-xl border border-[#e8eeea] p-3 md:grid-cols-[150px_1fr]">
          <input type="hidden" name="row_key" value={r.k} />
          <ImageField name={`row_${r.k}_img`} folder="pages" multiple={false} existing={r.img ? [r.img] : []} help={kind === "people" ? "Photo" : "Logo"} />
          <div className="flex flex-col gap-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div><label className="a-label">{kind === "people" ? "Name" : "Organisation"}</label><input name="row_name" defaultValue={r.name} className="a-input" /></div>
              {kind === "people" ? (
                <div><label className="a-label">Role</label><input name="row_role" defaultValue={r.role} placeholder="e.g. Managing Director" className="a-input" /></div>
              ) : (
                <div><label className="a-label">Website (optional)</label><input name="row_url" defaultValue={r.url} placeholder="https://…" className="a-input" /></div>
              )}
            </div>
            {kind === "people" && (
              <div><label className="a-label">Short bio (optional)</label><textarea name="row_bio" rows={3} defaultValue={r.bio} className="a-textarea" /></div>
            )}
            <div className="flex gap-2 text-sm">
              <button type="button" className="a-btn-ghost h-8" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button type="button" className="a-btn-ghost h-8" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button type="button" className="font-semibold text-[#a3361f]" onClick={() => setRows((x) => x.filter((y) => y.k !== r.k))}>Remove</button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="a-btn-ghost self-start" onClick={() => setRows((x) => [...x, { k: key(), name: "", role: "", bio: "", url: "", img: null }])}>
        + Add {kind === "people" ? "person" : "logo"}
      </button>
    </div>
  );
}
