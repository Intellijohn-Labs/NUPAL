"use client";

import { useState } from "react";
import { saveBlock } from "@/app/admin/(panel)/pages/block-actions";
import { BLOCK_LABELS, type CardsData, type GalleryData, type IntroData, type Logo, type LogosData, type MessageData, type PeopleData, type Person, type StatsData, type TextData, type TimelineData } from "@/lib/blocks";
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

      {block.type === "intro" && <IntroFields d={d as IntroData} />}
      {block.type === "stats" && (
        <SimpleRows
          noun="number"
          cols={[{ key: "value", label: "Number", w: "110px", ph: "50" }, { key: "suffix", label: "After it", w: "80px", ph: "+" }, { key: "label", label: "Label", ph: "Years of practice" }]}
          initial={((d as StatsData).stats ?? []).map((s) => ({ value: String(s.value), suffix: s.suffix, label: s.label }))}
          help="Numbers count up when visitors scroll to them. Up to 4 look best."
        />
      )}
      {block.type === "timeline" && (
        <SimpleRows
          noun="milestone"
          cols={[{ key: "year", label: "Year", w: "100px", ph: "1965" }, { key: "title", label: "Title", ph: "NUPAL founded in Kochi" }, { key: "text", label: "Short text", ph: "Optional", long: true }]}
          initial={((d as TimelineData).items ?? []) as Record<string, string>[]}
          help="Shown in order, oldest first."
        />
      )}
      {block.type === "cards" && (
        <>
          <div>
            <label className="a-label">Intro (optional)</label>
            <textarea name="intro" rows={2} defaultValue={(d as CardsData).intro ?? ""} className="a-textarea" />
          </div>
          <SimpleRows
            noun="card"
            cols={[{ key: "title", label: "Title", ph: "Authentic formulations" }, { key: "text", label: "Text", ph: "One or two sentences", long: true }]}
            initial={((d as CardsData).cards ?? []) as Record<string, string>[]}
            help="Cards are numbered 01, 02, 03… automatically. 3 or 4 look best."
          />
        </>
      )}
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

function IntroFields({ d }: { d: IntroData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-3">
        <div><label className="a-label">Small line above the title</label><input name="eyebrow" defaultValue={d.eyebrow ?? ""} placeholder="e.g. Our story" className="a-input" /></div>
        <div>
          <label className="a-label">Introduction</label>
          <textarea name="body" rows={7} defaultValue={d.body ?? ""} className="a-textarea" />
          <p className="a-help">{MD_HELP}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="a-label">Name under the text (optional)</label><input name="name" defaultValue={d.name ?? ""} placeholder="e.g. founder’s name" className="a-input" /></div>
          <div><label className="a-label">Their role</label><input name="role" defaultValue={d.role ?? ""} placeholder="e.g. Founder" className="a-input" /></div>
        </div>
      </div>
      <div><p className="a-label">Wide photo</p><ImageField name="image" folder="pages" maxSide={2200} multiple={false} existing={d.image ? [d.image] : []} help="A wide photo — the factory, clinic, herbs or founder. Landscape works best." /></div>
    </div>
  );
}

type Col = { key: string; label: string; w?: string; ph?: string; long?: boolean };

/** Generic repeatable rows; each column is submitted as `row_<key>` in order. */
function SimpleRows({ cols, initial, noun, help }: { cols: Col[]; initial: Record<string, string>[]; noun: string; help?: string }) {
  const [rows, setRows] = useState<Record<string, string>[]>(() => initial.map((r) => ({ ...r, _k: key() })));
  const short = cols.filter((c) => !c.long);
  const long = cols.filter((c) => c.long);
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
      {help && <p className="a-help">{help}</p>}
      {rows.map((r, i) => (
        <div key={r._k} className="flex flex-col gap-2 rounded-xl border border-[#e8eeea] p-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: short.map((c) => c.w ?? "1fr").join(" ") }}>
            {short.map((c) => (
              <div key={c.key}>
                <label className="a-label">{c.label}</label>
                <input name={`row_${c.key}`} defaultValue={r[c.key] ?? ""} placeholder={c.ph} className="a-input" />
              </div>
            ))}
          </div>
          {long.map((c) => (
            <div key={c.key}>
              <label className="a-label">{c.label}</label>
              <textarea name={`row_${c.key}`} rows={2} defaultValue={r[c.key] ?? ""} placeholder={c.ph} className="a-textarea" />
            </div>
          ))}
          <div className="flex gap-2 text-sm">
            <button type="button" className="a-btn-ghost h-8" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
            <button type="button" className="a-btn-ghost h-8" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            <button type="button" className="font-semibold text-[#a3361f]" onClick={() => setRows((x) => x.filter((y) => y._k !== r._k))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="a-btn-ghost self-start" onClick={() => setRows((x) => [...x, { _k: key() }])}>+ Add {noun}</button>
    </div>
  );
}
