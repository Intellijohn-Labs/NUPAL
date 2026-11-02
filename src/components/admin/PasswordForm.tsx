"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/(panel)/account/actions";
import { SubmitButton } from "./ui";

export function PasswordForm() {
  const [msg, action] = useActionState(changePassword, null);
  return (
    <form action={action} className="a-card flex max-w-md flex-col gap-3">
      <div><label htmlFor="cur" className="a-label">Current password</label><input id="cur" name="current" type="password" required autoComplete="current-password" className="a-input" /></div>
      <div><label htmlFor="nw" className="a-label">New password</label><input id="nw" name="next" type="password" required minLength={8} autoComplete="new-password" className="a-input" /></div>
      <div><label htmlFor="cf" className="a-label">Repeat new password</label><input id="cf" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="a-input" /></div>
      {msg && msg !== "OK" && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{msg}</p>}
      {msg === "OK" && <p role="status" className="rounded-lg bg-[#ddf0e3] px-3 py-2 text-sm text-[#1e5a36]">Password changed.</p>}
      <SubmitButton>Change password</SubmitButton>
    </form>
  );
}
