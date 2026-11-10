import Link from "next/link";
import { Logo } from "./Logo";
import { PLATFORMS, SocialIcon } from "./SocialIcon";

type Props = {
  concerns?: { name: string; slug: string }[];
  pages: { title: string; slug: string }[];
  settings: { legalName: string; address: string; phone: string; email: string; customerCareHours: string; footerLegal?: string };
  socials: { id: string; platform: string; label: string; url: string }[];
};

export function Footer({ pages, settings, socials }: Props) {
  return (
    <footer className="relative mt-12 bg-[#0F3A28] pb-24 text-cream lg:pb-0">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 flex flex-col items-start gap-4 lg:col-span-1">
          <Logo light className="h-12 w-auto" />
          <p className="text-[15px] text-[#c9d4c8]">Rooted in Ayurveda. Committed to your wellbeing.</p>
          <p className="text-[15px] leading-7 text-[#c9d4c8]">
            {settings.legalName && (
              <>
                {settings.legalName}
                <br />
              </>
            )}
            {settings.address}
          </p>
          <p className="text-[15px] leading-7 text-[#c9d4c8]">
            {settings.phone && <>Ph: {settings.phone}<br /></>}
            {settings.customerCareHours && <>Customer care: {settings.customerCareHours}<br /></>}
            {settings.email && <a className="underline" href={`mailto:${settings.email}`}>{settings.email}</a>}
          </p>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="NUPAL on social media">
              {socials.map((s) => {
                const name = `${PLATFORMS[s.platform] ?? s.platform}${s.label ? ` – ${s.label}` : ""}`;
                return (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} (opens in a new tab)`}
                      title={name}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-leaf hover:text-forest"
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-gold">Shop</h2>
          <ul className="grid gap-2 text-[15px] text-[#c9d4c8]">
            <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
            <li><Link href="/concerns" className="hover:text-white">Shop by Concern</Link></li>
            <li><Link href="/#bestsellers" className="hover:text-white">Bestsellers</Link></li>
            <li><Link href="/results" className="hover:text-white">Real Results</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-gold">Explore</h2>
          <ul className="grid gap-2 text-[15px] text-[#c9d4c8]">
            <li><Link href="/about-us" className="hover:text-white">About Nupal</Link></li>
            <li><Link href="/stories" className="hover:text-white">Customer Experiences</Link></li>
            <li><Link href="/reviews" className="hover:text-white">Customer Reviews</Link></li>
            <li><Link href="/consult" className="hover:text-white">Consultation</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-gold">Support &amp; information</h2>
          <ul className="grid gap-2 text-[15px] text-[#c9d4c8]">
            {pages.map((p) => (
              <li key={p.slug}><Link href={`/${p.slug}`} className="hover:text-white">{p.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x">
        <p className="border-t border-white/15 pb-6 pt-5 text-xs leading-relaxed text-[#9fb0a4]">
          © {new Date().getFullYear()} NUPAL Remedies. All rights reserved.
          {settings.footerLegal ? ` ${settings.footerLegal}` : ""}
        </p>
      </div>
    </footer>
  );
}
