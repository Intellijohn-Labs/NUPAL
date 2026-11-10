"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

/** Bottom action bar on phones: Products, Concerns, Consult (raised), Cart, Account — always within thumb reach. */
export function MobileBar(_props: { whatsapp?: string }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { count } = useCart();
  const path = usePathname();
  const item = "flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[11px] text-muted";
  const ic = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  return (
    <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-white px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-8px_24px_-16px_rgba(0,0,0,.35)] lg:hidden">
      <Link href="/shop" className={`${item} ${path.startsWith("/shop") ? "font-semibold text-forest" : ""}`}>
        <svg {...ic}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>
        Products
      </Link>
      <Link href="/concerns" className={`${item} ${path.startsWith("/concern") ? "font-semibold text-forest" : ""}`}>
        <svg {...ic}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
        Concerns
      </Link>
      <Link href="/consult" className={`${item} font-semibold text-forest`}>
        <span className="-mt-6 flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] border-white bg-forest text-gold shadow-[0_8px_18px_-8px_rgba(0,0,0,.5)]">
          <svg {...ic}><path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="12" r="2" /></svg>
        </span>
        Consult
      </Link>
      <Link href="/cart" className={`relative ${item} ${path === "/cart" ? "font-semibold text-forest" : ""}`} aria-label={`Cart, ${count} items`}>
        <svg {...ic}><path d="M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0" /></svg>
        Cart
        {count > 0 && <span className="absolute left-1/2 top-1 ml-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brick px-1 text-[11px] font-semibold text-white">{count}</span>}
      </Link>
      <Link href="/account" className={`${item} ${path === "/account" ? "font-semibold text-forest" : ""}`}>
        <svg {...ic}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
        Account
      </Link>
    </nav>
  );
}
