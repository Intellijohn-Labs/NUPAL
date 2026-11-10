"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

type Concern = { name: string; slug: string };

export function Header({ concerns }: { concerns: Concern[]; types?: string[] }) {
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
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("nupal:menu", toggle);
    return () => {
      document.removeEventListener("click", onDoc);
      window.removeEventListener("nupal:menu", toggle);
    };
  }, []);
  const pick = (e: React.MouseEvent) => {
    setOpen(false);
    (e.currentTarget as HTMLElement).closest("details")?.removeAttribute("open");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex items-center gap-3 py-2.5 sm:gap-6 sm:py-3">
        <button
          type="button"
          className="-ml-2 hidden h-11 w-11 items-center justify-center"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
        <Logo className="h-8 w-auto sm:h-11" />

        <form action="/shop" role="search" className="flex h-11 min-w-0 flex-1 items-center sm:h-12 gap-2 rounded-full border border-line bg-white px-5 transition-colors focus-within:border-sage lg:order-none lg:w-auto lg:flex-1">
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
            placeholder="Search “Kamilari”, “liver care”…"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
        </form>

        <div className="ml-auto hidden items-center gap-1 lg:ml-0 lg:flex">
          <Link href="/consult" className="btn hidden h-11 bg-forest px-5 text-sm text-cream hover:bg-forest-deep sm:inline-flex">
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
        <div className="container-x flex flex-col gap-1 py-2 text-[15px] font-medium lg:flex-row lg:items-center lg:gap-8 lg:py-0 lg:text-base">
          <Link href="/shop" className="border-b-2 border-transparent py-2 hover:border-leaf lg:py-3" onClick={pick}>
            Shop All
          </Link>
          {/* Mega menu: every health concern lives here; only six show on the homepage */}
          <details className="group relative lg:py-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 border-b-2 border-transparent py-2 hover:border-leaf lg:py-0">
              Shop by Concern <span aria-hidden="true" className="text-xs">▾</span>
            </summary>
            <div className="py-2 pl-3 lg:absolute lg:left-0 lg:top-full lg:z-50 lg:mt-2 lg:w-[520px] lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:px-6 lg:py-5 lg:shadow-[0_24px_50px_-28px_rgba(0,0,0,.4)]">
              <p className="mb-2 hidden text-xs uppercase tracking-[.14em] text-muted lg:block">Shop by concern</p>
              <div className="grid gap-x-6 gap-y-1 lg:grid-cols-2">
                {concerns.map((c) => (
                  <Link key={c.slug} href={`/concern/${c.slug}`} className="rounded-lg px-2 py-2 font-normal hover:bg-mist lg:px-0 lg:hover:bg-transparent lg:hover:text-brick" onClick={pick}>
                    {c.name}
                  </Link>
                ))}
              </div>
              <Link href="/concerns" className="mt-3 inline-block px-2 font-semibold text-brick lg:px-0" onClick={pick}>
                Explore all health concerns →
              </Link>
            </div>
          </details>
          <Link href="/#bestsellers" className="border-b-2 border-transparent py-2 hover:border-leaf lg:py-3" onClick={pick}>
            Bestsellers
          </Link>
          <Link href="/consult" className="border-b-2 border-transparent py-2 hover:border-leaf lg:py-3" onClick={pick}>
            Consult a Doctor
          </Link>
          <Link href="/about-us" className="border-b-2 border-transparent py-2 hover:border-leaf lg:py-3" onClick={pick}>
            About Nupal
          </Link>
        </div>
      </nav>
    </header>
  );
}
