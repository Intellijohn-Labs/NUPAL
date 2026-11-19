"use client";

import { useId, useState } from "react";

/** Product page: Description · Key Ingredients · How To Use · Product Details, as tabs in a soft green box. */
export function ProductTabs({ tabs }: { tabs: { key: string; label: string; content: React.ReactNode }[] }) {
  const [on, setOn] = useState(0);
  const id = useId();
  if (!tabs.length) return null;
  const move = (d: number) => setOn((x) => (x + d + tabs.length) % tabs.length);
  return (
    <div className="rounded-2xl border border-[#DCE8D6] bg-[#F4F8F1] p-3 sm:p-4">
      <div role="tablist" aria-label="Product information" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`${id}-t-${t.key}`}
            type="button"
            role="tab"
            aria-selected={i === on}
            aria-controls={`${id}-p-${t.key}`}
            tabIndex={i === on ? 0 : -1}
            onClick={() => setOn(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(1);
              if (e.key === "ArrowLeft") move(-1);
            }}
            className={`h-10 shrink-0 rounded-lg border px-3.5 text-[14px] font-medium transition-colors ${i === on ? "border-[#397C42] bg-[#397C42] text-white" : "border-[#D3E0CD] bg-[#E6EFE1] text-[#174D36] hover:bg-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.key} id={`${id}-p-${t.key}`} role="tabpanel" aria-labelledby={`${id}-t-${t.key}`} hidden={i !== on} className="border-t border-[#DCE8D6] px-1 pt-4 text-[15px] leading-7 text-[#343B35] sm:px-2">
          {t.content}
        </div>
      ))}
    </div>
  );
}
