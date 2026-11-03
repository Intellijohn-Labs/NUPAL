"use client";

import { useState } from "react";

/** Question/answer rows submitted as parallel `faq_q` / `faq_a` fields. */
export function FaqFields({ initial }: { initial: { q: string; a: string }[] }) {
  const [rows, setRows] = useState(initial.map((r, i) => ({ ...r, k: `f${i}` })));
  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && <p className="text-sm text-[#56685d]">No questions yet.</p>}
      {rows.map((r) => (
        <div key={r.k} className="grid gap-2 rounded-xl border border-[#e8eeea] p-3">
          <input name="faq_q" aria-label="Question" defaultValue={r.q} placeholder="Question" className="a-input" />
          <textarea name="faq_a" aria-label="Answer" defaultValue={r.a} rows={2} placeholder="Answer" className="a-textarea" />
          <button type="button" className="justify-self-start text-sm font-semibold text-[#a3361f]" onClick={() => setRows((x) => x.filter((y) => y.k !== r.k))}>
            Remove question
          </button>
        </div>
      ))}
      <button type="button" className="a-btn-ghost self-start" onClick={() => setRows((x) => [...x, { q: "", a: "", k: `n${Date.now()}` }])}>
        + Add question
      </button>
    </div>
  );
}
