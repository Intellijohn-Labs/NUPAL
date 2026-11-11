"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

type Concern = { name: string; slug: string };
type Panel = "concerns" | "search" | "menu" | null;

const POPULAR = ["Kamilari", "Hairomax", "Liver care", "Diawin", "Sumangaly"];

const navLink =
  "relative py-2 text-[12.5px] font-medium uppercase tracking-[.06em] text-ink whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0.5 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-forest after:transition-transform after:duration-300 hover:after:scale-x-100 xl:text-[13px]";

/**
 * Header (approved mockup, Ujala-style): white bar, menu in small capitals split around a centred logo,
 * a lens icon that opens a search panel, and the bag. Phones: menu button, centred logo, lens and bag.
 */
export function Header({ concerns }: { concerns: Concern[]; types?: string[] }) {
  const { count } = useCart();
  const [panel, setPanel] = useState<Panel>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const path = usePathname();

  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));
  const close = () => setPanel(null);

  // Close on route change, Esc, or a click outside the header. The phone bar’s menu button opens the menu.
  useEffect(close, [path]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onMenu = () => setPanel((cur) => (cur === "menu" ? null : "menu"));
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("nupal:menu", onMenu);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("nupal:menu", onMenu);
    };
  }, []);
  useEffect(() => {
    if (panel === "search") setTimeout(() => searchRef.current?.focus(), 30);
  }, [panel]);

  const go = (q: string) => {
    close();
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const icon = "relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-[#F4F1E8]";
  const sheet = "absolute inset-x-0 top-full border-b border-line bg-white shadow-[0_24px_40px_-30px_rgba(0,0,0,.35)]";

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-[76px] lg:px-8 xl:px-12">
        {/* left: menu button (phones) / first half of the menu (desktop) */}
        <div className="flex items-center">
          <button type="button" aria-label={panel === "menu" ? "Close menu" : "Open menu"} aria-expanded={panel === "menu"} aria-controls="site-menu" onClick={() => toggle("menu")} className={`${icon} -ml-2.5 lg:hidden`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d={panel === "menu" ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
          <nav aria-label="Shop" className="hidden items-center gap-6 lg:flex xl:gap-9">
            <Link href="/shop" className={navLink}>Shop All</Link>
            <button type="button" aria-expanded={panel === "concerns"} aria-controls="concern-menu" onClick={() => toggle("concerns")} className={`${navLink} flex items-center gap-1.5 ${panel === "concerns" ? "after:scale-x-100" : ""}`}>
              Shop by Concern
              <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" className={`transition-transform ${panel === "concerns" ? "rotate-180" : ""}`}><path d="M1 3l4 4 4-4z" /></svg>
            </button>
            <Link href="/#bestsellers" className={navLink}>Bestsellers</Link>
          </nav>
        </div>

        {/* centre: logo */}
        <Logo className="h-8 w-auto lg:h-10" />

        {/* right: rest of the menu (desktop), lens and bag */}
        <div className="flex items-center justify-end gap-1">
          <nav aria-label="More" className="mr-3 hidden items-center gap-6 lg:flex xl:mr-5 xl:gap-9">
            <Link href="/consult" className={`${navLink} flex items-center gap-2 font-semibold text-forest`}>
              <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-[#3E8E4A] shadow-[0_0_0_3px_#DCEFDB]" />
              Consult a Doctor
            </Link>
            <Link href="/about-us" className={navLink}>About Nupal</Link>
          </nav>
          <button type="button" aria-label="Search" aria-expanded={panel === "search"} aria-controls="site-search-panel" onClick={() => toggle("search")} className={`${icon} ${panel === "search" ? "bg-[#F4F1E8]" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5L20 20" />
            </svg>
          </button>
          <Link href="/cart" aria-label={`Cart, ${count} items`} className={`${icon} -mr-2.5`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-brick px-1 text-[10.5px] font-semibold text-white">{count}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Shop by Concern (desktop) */}
      {panel === "concerns" && (
        <div id="concern-menu" className={`${sheet} hidden lg:block`}>
          <div className="container-x py-7">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted">Shop by health concern</p>
            <div className="mt-3 grid max-w-[900px] grid-cols-4 gap-x-8 gap-y-1">
              {concerns.map((c) => (
                <Link key={c.slug} href={`/concern/${c.slug}`} className="py-2 text-[15px] hover:text-brick">{c.name}</Link>
              ))}
            </div>
            <Link href="/concerns" className="mt-4 inline-block text-sm font-semibold text-brick hover:underline">Explore all health concerns →</Link>
          </div>
        </div>
      )}

      {/* Search panel (lens) */}
      {panel === "search" && (
        <div id="site-search-panel" className={sheet}>
          <div className="container-x py-5 sm:py-7">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchRef.current?.value.trim();
                if (q) go(q);
              }}
              className="mx-auto flex max-w-[720px] items-center gap-3 border-b-[1.5px] border-ink pb-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-muted">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5L20 20" />
              </svg>
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <input ref={searchRef} id="site-search" name="q" type="search" autoComplete="off" placeholder="Search “Kamilari”, “liver care”…" className="h-10 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted sm:text-xl" />
              <button type="button" onClick={close} className="shrink-0 text-xs font-medium uppercase tracking-[.08em] text-muted hover:text-ink">Close</button>
            </form>
            <div className="mx-auto mt-4 flex max-w-[720px] flex-wrap items-center gap-2 text-sm text-muted">
              Popular:
              {POPULAR.map((p) => (
                <button key={p} type="button" onClick={() => go(p)} className="rounded-full border border-line px-3 py-1.5 text-ink hover:border-forest">{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phone menu */}
      {panel === "menu" && (
        <nav id="site-menu" aria-label="Main" className={`${sheet} max-h-[calc(100svh-120px)] overflow-y-auto lg:hidden`}>
          <div className="container-x pb-4 pt-1 text-[14px] font-medium uppercase tracking-[.06em]">
            <Link href="/shop" className="block border-b border-line py-3.5">Shop All</Link>
            <details className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3.5">
                Shop by Concern
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" className="transition-transform group-open:rotate-180"><path d="M1 3l4 4 4-4z" /></svg>
              </summary>
              <div className="pb-3 normal-case tracking-normal">
                {concerns.map((c) => (
                  <Link key={c.slug} href={`/concern/${c.slug}`} className="block py-2.5 pl-3 font-normal">{c.name}</Link>
                ))}
                <Link href="/concerns" className="block py-2.5 pl-3 font-semibold text-brick">Explore all health concerns →</Link>
              </div>
            </details>
            <Link href="/#bestsellers" className="block border-b border-line py-3.5">Bestsellers</Link>
            <Link href="/consult" className="flex items-center gap-2 border-b border-line py-3.5 font-semibold text-forest">
              <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-[#3E8E4A] shadow-[0_0_0_3px_#DCEFDB]" />
              Consult a Doctor
            </Link>
            <Link href="/about-us" className="block py-3.5">About Nupal</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
