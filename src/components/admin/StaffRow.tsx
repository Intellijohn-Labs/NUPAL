"use client";

import Link from "next/link";
import { useState } from "react";
import { SubmitButton } from "./ui";

type U = { id: string; name: string; email: string; role: string; active: boolean; doctorId: string | null };

export function StaffRow({ u, isMe, roles, doctors, action }: { u: U; isMe: boolean; roles: [string, string][]; doctors: { id: string; name: string }[]; action: (f: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(u.role);
  const roleLabel = roles.find(([r]) => r === u.role)?.[1] ?? u.role;
  const doctorName = doctors.find((d) => d.id === u.doctorId)?.name;

  return (
    <div className="a-card">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{u.name}{isMe && <span className="font-normal text-[#56685d]"> (you)</span>}</p>
          <p className="truncate text-sm text-[#56685d]">{u.email}</p>
        </div>
        <span className="rounded-full bg-[#eef4f0] px-3 py-1 text-sm font-semibold text-[#1e5a36]">
          {roleLabel}{doctorName ? ` · ${doctorName}` : ""}
        </span>
        {!u.active && <span className="rounded-full bg-[#fbe6e0] px-3 py-1 text-sm font-semibold text-[#a3361f]">Blocked</span>}
        {isMe ? (
          <Link href="/admin/account" className="a-btn-ghost">Change my password</Link>
        ) : (
          <button type="button" className="a-btn-ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Edit"}
          </button>
        )}
      </div>

      {open && !isMe && (
        <form action={action} className="mt-4 grid gap-4 border-t border-[#e8eeea] pt-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`r-${u.id}`} className="a-label">Role</label>
            <select id={`r-${u.id}`} name="role" value={role} onChange={(e) => setRole(e.target.value)} className="a-input">
              {roles.map(([r, l]) => <option key={r} value={r}>{l}</option>)}
            </select>
          </div>
          {role === "DOCTOR" ? (
            <div>
              <label htmlFor={`d-${u.id}`} className="a-label">Which doctor is this?</label>
              <select id={`d-${u.id}`} name="doctorId" defaultValue={u.doctorId ?? ""} className="a-input">
                <option value="">Choose a doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <p className="a-help">They will only see their own consultations.</p>
            </div>
          ) : <div />}
          <div>
            <label htmlFor={`p-${u.id}`} className="a-label">Reset password</label>
            <input id={`p-${u.id}`} name="password" type="password" minLength={8} autoComplete="new-password" placeholder="Leave empty to keep it" className="a-input" />
          </div>
          <label className="flex items-end gap-2 pb-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={u.active} className="h-5 w-5 accent-[#2e6b47]" />
            Can sign in (untick to block)
          </label>
          <div className="sm:col-span-2"><SubmitButton>Save changes</SubmitButton></div>
        </form>
      )}
    </div>
  );
}
