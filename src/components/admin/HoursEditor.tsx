"use client";

import { useState } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Row = { day: number; start: string; end: string };

export function HoursEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const add = (day: number) => setRows((r) => [...r, { day, start: "10:00", end: "13:00" }]);
  const copyToAll = (day: number) =>
    setRows((r) => {
      const src = r.filter((x) => x.day === day);
      const out = r.filter((x) => x.day === day || x.day === 0);
      for (let d = 1; d <= 6; d++) if (d !== day) out.push(...src.map((s) => ({ ...s, day: d })));
      return out;
    });

  return (
    <div className="flex flex-col divide-y divide-[#e8eeea]">
      {DAYS.map((name, day) => {
        const mine = rows.map((r, i) => ({ ...r, i })).filter((r) => r.day === day);
        return (
          <div key={day} className="flex flex-wrap items-center gap-3 py-3">
            <span className="w-24 font-semibold">{name}</span>
            <div className="flex flex-1 flex-col gap-2">
              {mine.length === 0 && <span className="text-sm text-[#56685d]">Not available</span>}
              {mine.map((r) => (
                <div key={r.i} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="a_day" value={day} />
                  <input type="time" name="a_start" aria-label={`${name} start`} value={r.start} step={900}
                    onChange={(e) => setRows((x) => x.map((y, k) => (k === r.i ? { ...y, start: e.target.value } : y)))} className="a-input w-32" />
                  <span>to</span>
                  <input type="time" name="a_end" aria-label={`${name} end`} value={r.end} step={900}
                    onChange={(e) => setRows((x) => x.map((y, k) => (k === r.i ? { ...y, end: e.target.value } : y)))} className="a-input w-32" />
                  <button type="button" className="text-sm font-semibold text-[#a3361f]" onClick={() => setRows((x) => x.filter((_, k) => k !== r.i))}>Remove</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" className="a-btn-ghost h-9" onClick={() => add(day)}>+ Hours</button>
              {mine.length > 0 && day !== 0 && <button type="button" className="a-btn-ghost h-9" onClick={() => copyToAll(day)}>Copy to Mon–Sat</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
