import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your account" };

/** Until customer sign-in is added: quick help for orders, and the main links. */
export default async function AccountPage() {
  const [s, pages] = await Promise.all([getSettings(), db.page.findMany({ where: { published: true, inFooter: true }, orderBy: { title: "asc" }, select: { title: true, slug: true } })]);
  const wa = s.whatsappNumber.replace(/\D/g, "");
  const row = "flex min-h-[56px] items-center justify-between gap-3 border-b border-line px-1 text-[16px] last:border-0";
  return (
    <div className="container-x max-w-[640px] py-10 sm:py-14">
      <h1 className="text-[clamp(30px,4vw,44px)]">Your account</h1>
      <p className="mt-2 text-muted">Signing in with your phone number is coming soon. Meanwhile, here is everything you need.</p>

      <section aria-labelledby="orders-h" className="mt-8 rounded-3xl bg-white p-5 sm:p-6">
        <h2 id="orders-h" className="font-sans text-lg font-semibold">Track my order</h2>
        <p className="mt-1 leading-7 text-muted">
          Open the order link we sent after checkout to see its status. Can’t find it? Our team will help — just share your phone number.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          {wa && (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent("Hello NUPAL, I’d like to check my order status.")}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Ask on WhatsApp
            </a>
          )}
          {s.phone && <a href={`tel:${s.phone.split(",")[0].replace(/\s/g, "")}`} className="btn-outline">Call {s.phone.split(",")[0]}</a>}
        </div>
      </section>

      <ul className="mt-6 rounded-3xl bg-white px-5 py-2 sm:px-6">
        {[
          ["My cart", "/cart"],
          ["Book a consultation", "/consult"],
          ["About Nupal", "/about-us"],
          ...pages.map((p) => [p.title, `/${p.slug}`]),
        ].map(([label, href]) => (
          <li key={href}>
            <Link href={href} className={row}>
              {label}
              <span aria-hidden="true" className="text-muted">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
