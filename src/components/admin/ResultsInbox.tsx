"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadFiles, type UploadState } from "@/lib/upload-client";
import { autoPair, createResult, deleteUploads, registerUploads, updateInboxItem, type ExistingResult } from "@/app/admin/(panel)/results/actions";

type Up = { id: string; url: string; filename: string; patientId: string; role: string };

export function ResultsInbox({ uploads, existingIds }: { uploads: Up[]; existingIds: string[] }) {
  const taken = new Set(existingIds);
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const [progress, setProgress] = useState<UploadState[]>([]);
  const [drag, setDrag] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<null | { kind: "pair" | "single"; ids: string[] }>(null);

  const done = progress.filter((p) => p.status === "done").length;
  const failed = progress.filter((p) => p.status === "failed");
  const uploading = progress.length > 0 && done + failed.length < progress.length;

  async function onFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setMsg("");
    setProgress(files.map((f) => ({ name: f.name, status: "waiting" })));
    const res = await uploadFiles(files, "results", (i, s) => setProgress((p) => p.map((x, k) => (k === i ? s : x))));
    const ok = res.map((r, i) => ({ r, f: files[i] })).filter((x) => x.r.url);
    for (let i = 0; i < ok.length; i += 100) await registerUploads(ok.slice(i, i + 100).map((x) => ({ url: x.r.url!, filename: x.f.name })));
    setMsg(`${ok.length} ${ok.length === 1 ? "photo" : "photos"} added to the inbox.`);
    router.refresh();
  }

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const byId = (id: string) => uploads.find((u) => u.id === id)!;

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-8 text-center ${drag ? "border-[#2e6b47] bg-[#eef4f0]" : "border-[#b9c6be] bg-white"}`}
      >
        <span className="text-base font-semibold text-[#2e6b47]">Drop photos here, or click to choose (up to 200 at a time)</span>
        <span className="text-sm text-[#56685d]">
          Tip: name files like <code>NU61244_before.jpg</code> and <code>NU61244_after.jpg</code> — the patient ID and before/after are filled in automatically.
        </span>
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
      </label>

      {progress.length > 0 && (
        <div className="a-card" role="status" aria-live="polite">
          <div className="mb-2 flex justify-between text-sm font-semibold">
            <span>{uploading ? "Uploading…" : "Upload finished"}</span>
            <span>{done} of {progress.length}{failed.length ? ` · ${failed.length} failed` : ""}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e3eae5]"><div className="h-full bg-[#2e6b47] transition-[width]" style={{ width: `${((done + failed.length) / progress.length) * 100}%` }} /></div>
          {failed.length > 0 && <p className="mt-2 text-sm text-[#a3361f]">Failed: {failed.slice(0, 5).map((f) => f.name).join(", ")}{failed.length > 5 ? "…" : ""} — {failed[0].error}. Drop them again to retry.</p>}
        </div>
      )}
      {msg && <p role="status" className="rounded-lg bg-[#ddf0e3] px-4 py-2 text-sm font-medium text-[#1e5a36]">{msg}</p>}

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-[#dce5df] bg-white p-3">
        <span className="text-sm font-semibold">{sel.length} selected</span>
        <button className="a-btn" disabled={sel.length !== 2} onClick={() => setForm({ kind: "pair", ids: [...sel] })}>Make before/after pair</button>
        <button className="a-btn-ghost" disabled={sel.length !== 1} onClick={() => setForm({ kind: "single", ids: [...sel] })}>Use as one image</button>
        <button
          className="a-btn-ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const { made, skipped } = await autoPair(false);
              setMsg(
                (made ? `${made} pairs made from file names. Review them in Drafts, tick permission and publish.` : "No new before/after pairs found in file names.") +
                  (skipped.length ? ` Skipped ${skipped.length} (patient already has a result: ${skipped.slice(0, 5).join(", ")}${skipped.length > 5 ? "…" : ""}).` : ""),
              );
              router.refresh();
            })
          }
        >
          Auto-pair by file name
        </button>
        {sel.length > 0 && (
          <>
            <button className="a-btn-ghost" onClick={() => setSel([])}>Clear selection</button>
            <button
              className="a-btn-danger"
              onClick={() => {
                if (!confirm(`Delete ${sel.length} photo(s)?`)) return;
                start(async () => {
                  await deleteUploads(sel);
                  setSel([]);
                  router.refresh();
                });
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {uploads.length === 0 ? (
        <p className="a-card text-center text-[#56685d]">The inbox is empty. Uploaded photos wait here until you turn them into results.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {uploads.map((u) => {
            const n = sel.indexOf(u.id);
            return (
              <li key={u.id} className={`overflow-hidden rounded-xl border-2 bg-white ${n >= 0 ? "border-[#2e6b47]" : "border-[#dce5df]"}`}>
                <button type="button" onClick={() => toggle(u.id)} aria-pressed={n >= 0} aria-label={`Select ${u.filename}`} className="relative block aspect-square w-full">
                  <img src={u.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {n >= 0 && <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2e6b47] text-sm font-bold text-white">{n + 1}</span>}
                  {u.patientId && taken.has(u.patientId) && (
                    <span className="absolute bottom-2 left-2 right-2 rounded bg-[#f8edd2] px-1.5 py-0.5 text-center text-[11px] font-bold text-[#7a5410]">Already has a result</span>
                  )}
                </button>
                <div className="flex flex-col gap-1 p-2 text-xs">
                  <span className="truncate text-[#56685d]" title={u.filename}>{u.filename}</span>
                  <input
                    aria-label="Patient ID"
                    defaultValue={u.patientId}
                    placeholder="Patient ID"
                    onBlur={(e) => e.target.value !== u.patientId && updateInboxItem(u.id, { patientId: e.target.value })}
                    className="a-input h-8 text-xs"
                  />
                  <select aria-label="Before or after" defaultValue={u.role} onChange={(e) => updateInboxItem(u.id, { role: e.target.value })} className="a-input h-8 text-xs">
                    <option value="">Not set</option><option value="before">Before</option><option value="after">After</option>
                  </select>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {form && (
        <PairDialog
          kind={form.kind}
          items={form.ids.map(byId)}
          onClose={() => setForm(null)}
          onDone={() => {
            setForm(null);
            setSel([]);
            setMsg("Result saved.");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function PairDialog({ kind, items, onClose, onDone }: { kind: "pair" | "single"; items: Up[]; onClose: () => void; onDone: () => void }) {
  // Order by role if set, otherwise by selection order.
  const initial = kind === "pair" && items[0].role === "after" && items[1]?.role !== "after" ? [items[1], items[0]] : items;
  const [order, setOrder] = useState(initial);
  const [patientId, setPatientId] = useState(items.find((i) => i.patientId)?.patientId ?? "");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [dups, setDups] = useState<ExistingResult[] | null>(null);
  const [lastPublish, setLastPublish] = useState(false);
  const [pending, start] = useTransition();

  function save(publish: boolean, onDuplicate: "ask" | "keep" | "replace" = "ask") {
    setError("");
    setLastPublish(publish);
    start(async () => {
      const base = { patientId, consent, publish, onDuplicate };
      const r = await createResult(kind === "pair" ? { ...base, beforeId: order[0].id, afterId: order[1].id } : { ...base, singleId: order[0].id });
      if (!r.ok) {
        setError(r.error);
        setDups(r.duplicates ?? null);
        return;
      }
      onDone();
    });
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="pd-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5">
        <h2 id="pd-title" className="mb-3 font-sans text-lg font-semibold">{kind === "pair" ? "Before / after pair" : "Single image result"}</h2>
        <div className={`grid gap-3 ${kind === "pair" ? "grid-cols-2" : "grid-cols-1"}`}>
          {order.map((u, i) => (
            <figure key={u.id} className="m-0">
              <img src={u.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
              {kind === "pair" && <figcaption className="mt-1 text-center text-sm font-semibold">{i === 0 ? "Before" : "After"}</figcaption>}
            </figure>
          ))}
        </div>
        {kind === "pair" && (
          <button type="button" className="a-btn-ghost mt-3" onClick={() => setOrder((o) => [o[1], o[0]])}>⇆ Swap before and after</button>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="pd-id" className="a-label">Patient ID</label>
            <input id="pd-id" value={patientId} onChange={(e) => { setPatientId(e.target.value); setDups(null); setError(""); }} placeholder="NU 61244" className="a-input" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-[15px]">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5 accent-[#2e6b47]" />
            Customer gave permission to show these photos
          </label>
        </div>
        {error && !dups && <p role="alert" className="mt-3 rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
        {dups && (
          <div role="alert" className="mt-4 rounded-xl border border-[#e8d9a8] bg-[#f8edd2] p-3">
            <p className="font-semibold text-[#7a5410]">{error}</p>
            <p className="mt-1 text-sm text-[#7a5410]">Check the photos below. Is this the same patient?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {dups.map((d) => (
                <figure key={d.id} className="m-0 w-40">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt="" className="aspect-[2/1] w-full rounded-lg bg-white object-contain" />
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg">
                      <img src={d.beforeUrl ?? ""} alt="" className="aspect-square w-full object-cover" />
                      <img src={d.afterUrl ?? ""} alt="" className="aspect-square w-full object-cover" />
                    </div>
                  )}
                  <figcaption className="mt-1 text-xs text-[#7a5410]">Existing · {d.status.toLowerCase()}</figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="a-btn" disabled={pending} onClick={() => save(lastPublish, "replace")}>Replace the old result</button>
              <button className="a-btn-ghost" disabled={pending} onClick={() => save(lastPublish, "keep")}>Keep both</button>
              <button className="a-btn-ghost" onClick={() => { setDups(null); setError(""); }}>Change patient ID</button>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="a-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="a-btn-ghost" disabled={pending} onClick={() => save(false)}>Save as draft</button>
          <button className="a-btn" disabled={pending || !consent} onClick={() => save(true)}>Save and publish</button>
        </div>
      </div>
    </div>
  );
}
