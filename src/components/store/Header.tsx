"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

type Concern = { name: string; slug: string };

export function Header({ concerns, types }: { concerns: Concern[]; types: string[] }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside them, and when another one opens.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      navRef.current?.querySelectorAll("details[open]").forEach((d) => {
        if (!d.contains(e.target as Node)) d.removeAttribute("open");
      });
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  const pick = (e: React.MouseEvent) => {
    setOpen(false);
    (e.currentTarget as HTMLElement).closest("details")?.removeAttribute("open");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <button
          type="button"
          className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
        <Logo className="h-10 w-auto sm:h-12" />

        <form action="/shop" role="search" className="order-last flex h-12 w-full items-center gap-2 rounded-full border border-line bg-white px-5 transition-colors focus-within:border-sage lg:order-none lg:w-auto lg:flex-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6862" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search for “Kamilari”, “liver care”…"
            className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link href="/consult" className="btn hidden h-11 bg-forest px-5 text-sm text-cream hover:bg-[#2E5A3F] sm:inline-flex">
            Consult an expert
          </Link>
          <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative flex h-11 w-11 items-center justify-center">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 7h12l-1 13H7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {count > 0 && (
              <span className="absolute right-0 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-pestle px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav ref={navRef} aria-label="Main" className={`border-t border-line bg-cream ${open ? "block" : "hidden"} lg:block`}>
        <div className="container-x flex flex-col gap-1 py-2 text-[15px] font-medium lg:flex-row lg:items-center lg:gap-7 lg:py-0">
          <details className="group relative lg:py-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 py-2 lg:py-0">
              Shop by concern <span aria-hidden="true" className="text-xs">▾</span>
            </summary>
            <div className="grid gap-1 py-2 pl-3 lg:absolute lg:left-0 lg:top-full lg:z-50 lg:w-[460px] lg:grid-cols-2 lg:rounded-xl lg:border lg:border-line lg:bg-white lg:p-3 lg:shadow-lg">
              {concerns.map((c) => (
                <Link key={c.slug} href={`/concern/${c.slug}`} className="rounded-lg px-2 py-2 font-normal hover:bg-mist" onClick={pick}>
                  {c.name}
                </Link>
              ))}
            </div>
          </details>
          <details className="group relative lg:py-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 py-2 lg:py-0">
              Shop by product <span aria-hidden="true" className="text-xs">▾</span>
            </summary>
            <div className="grid gap-1 py-2 pl-3 lg:absolute lg:left-0 lg:top-full lg:z-50 lg:w-[260px] lg:rounded-xl lg:border lg:border-line lg:bg-white lg:p-3 lg:shadow-lg">
              {types.map((t) => (
                <Link key={t} href={`/shop?type=${encodeURIComponent(t)}`} className="rounded-lg px-2 py-2 font-normal hover:bg-mist" onClick={pick}>
                  {t}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/shop" className="py-2 lg:py-3">
            All products
          </Link>
          <Link href="/shop?brand=MONOEXTRACTS" className="py-2 lg:py-3">
            Monoextracts
          </Link>
          <Link href="/results" className="py-2 lg:py-3" onClick={pick}>
            Real results
          </Link>
          <Link href="/about-us" className="py-2 lg:py-3" onClick={pick}>
            About us
          </Link>
          <Link href="/consult" className="py-2 text-sage lg:hidden" onClick={pick}>
            Consult an expert
          </Link>
        </div>
      </nav>
    </header>
  );
}
