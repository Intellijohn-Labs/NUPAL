"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createStaff } from "@/app/admin/(panel)/staff/actions";
import { SubmitButton } from "./ui";

export function StaffCreateForm({ roles, doctors }: { roles: [string, string][]; doctors: { id: string; name: string }[] }) {
  const [msg, action] = useActionState(createStaff, null);
  const ref = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState("ORDERS");
  useEffect(() => {
    if (msg === "OK") {
      ref.current?.reset();
      setRole("ORDERS");
    }
  }, [msg]);
  return (
    <form ref={ref} action={action} className="a-card flex flex-col gap-3">
      <h2 className="font-sans text-lg font-semibold">Add staff member</h2>
      <div><label htmlFor="sn" className="a-label">Name</label><input id="sn" name="name" required className="a-input" /></div>
      <div><label htmlFor="se" className="a-label">Email</label><input id="se" name="email" type="email" required className="a-input" /></div>
      <div><label htmlFor="sp" className="a-label">Temporary password</label><input id="sp" name="password" type="password" minLength={8} required autoComplete="new-password" className="a-input" /></div>
      <div>
        <label htmlFor="sr" className="a-label">Role</label>
        <select id="sr" name="role" value={role} onChange={(e) => setRole(e.target.value)} className="a-input">{roles.map(([r, l]) => <option key={r} value={r}>{l}</option>)}</select>
      </div>
      {role === "DOCTOR" && (
        <div>
          <label htmlFor="sd" className="a-label">Which doctor is this?</label>
          <select id="sd" name="doctorId" className="a-input"><option value="">Choose a doctor</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          <p className="a-help">They will only see their own consultations.</p>
        </div>
      )}
      {msg && msg !== "OK" && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{msg}</p>}
      {msg === "OK" && <p role="status" className="rounded-lg bg-[#ddf0e3] px-3 py-2 text-sm text-[#1e5a36]">Staff member added. Share their email and temporary password with them.</p>}
      <SubmitButton>Add staff member</SubmitButton>
    </form>
  );
}
