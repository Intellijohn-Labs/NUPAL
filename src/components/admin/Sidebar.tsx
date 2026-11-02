"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string; area: string };

export function Sidebar({ items, userName, roleLabel, logout }: { items: Item[]; userName: string; roleLabel: string; logout: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  return (
    <aside className="bg-[#0e2017] text-[#eaf2ec] lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto [scrollbar-color:#2e4a3a_transparent] [scrollbar-width:thin]">
      <div className="flex items-center justify-between px-5 py-4 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/brand/nupal-logo-light.svg" alt="NUPAL" className="h-9 w-auto" />
          <span className="text-xs text-[#a3b8aa]">Admin</span>
        </Link>
        <button type="button" className="h-10 w-10 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
      </div>
      <nav aria-label="Admin" className={`${open ? "block" : "hidden"} px-3 pb-4 lg:block`}>
        <ul className="flex flex-col gap-0.5 text-[15px]">
          {items.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(i.href) ? "page" : undefined}
                className={`flex h-10 items-center rounded-lg px-3 ${isActive(i.href) ? "bg-[#2e6b47] font-semibold text-white" : "text-[#cfe0d4] hover:bg-white/5"}`}
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-white/10 px-3 pt-4 text-sm">
          <p className="font-medium">{userName}</p>
          <p className="text-[#a3b8aa]">{roleLabel}</p>
          <div className="mt-3 flex flex-col gap-1">
            <Link href="/admin/account" className="text-[#cfe0d4] hover:text-white">Change password</Link>
            <Link href="/" target="_blank" className="text-[#cfe0d4] hover:text-white">View website ↗</Link>
            <form action={logout}>
              <button className="text-[#cfe0d4] hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </nav>
    </aside>
  );
}
