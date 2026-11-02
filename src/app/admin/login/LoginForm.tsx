"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[#dce5df] bg-white p-7">
      <Image src="/brand/nupal-logo.svg" alt="NUPAL Ayurveda" width={151} height={65} className="mb-2 h-12 w-auto self-start" priority />
      <h1 className="font-sans text-xl font-semibold">Sign in to the admin panel</h1>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="a-label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="a-input" />
      </div>
      <div>
        <label htmlFor="password" className="a-label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="a-input" />
      </div>
      {error && <p role="alert" className="rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
      <button className="a-btn h-11" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
