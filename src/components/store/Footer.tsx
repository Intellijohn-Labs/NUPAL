import Link from "next/link";
import { Logo } from "./Logo";
import { PLATFORMS, SocialIcon } from "./SocialIcon";

type Props = {
  concerns: { name: string; slug: string }[];
  pages: { title: string; slug: string }[];
  settings: { legalName: string; address: string; phone: string; email: string; customerCareHours: string };
  socials: { id: string; platform: string; label: string; url: string }[];
};

export function Footer({ concerns, pages, settings, socials }: Props) {
  return (
    <footer className="bg-forest text-cream">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo light className="h-12 w-auto" />
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
          <h2 className="mb-4 text-xl">Shop by concern</h2>
          <ul className="grid gap-2 text-[15px] text-[#c9d4c8]">
            {concerns.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link href={`/concern/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xl">Help</h2>
          <ul className="grid gap-2 text-[15px] text-[#c9d4c8]">
            <li><Link href="/consult" className="hover:text-white">Consult a doctor</Link></li>
            <li><Link href="/results" className="hover:text-white">Real results</Link></li>
            <li><Link href="/reviews" className="hover:text-white">Customer reviews</Link></li>
            <li><Link href="/stories" className="hover:text-white">Customer stories</Link></li>
            <li><Link href="/cart" className="hover:text-white">Your cart</Link></li>
            {pages.filter((p) => !p.slug.includes("policy") && !p.slug.includes("terms")).map((p) => (
              <li key={p.slug}><Link href={`/${p.slug}`} className="hover:text-white">{p.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xl">Policies</h2>
          <ul className="grid gap-2 text-[15px] text-[#c9d4c8]">
            {pages.filter((p) => p.slug.includes("policy") || p.slug.includes("terms")).map((p) => (
              <li key={p.slug}><Link href={`/${p.slug}`} className="hover:text-white">{p.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-x flex flex-wrap justify-between gap-3 py-5 text-[13px] text-[#c9d4c8]">
          <span>© {new Date().getFullYear()} NUPAL Remedies. All rights reserved.</span>
          <span>Cash on delivery available · Online payment coming soon</span>
        </div>
      </div>
    </footer>
  );
}
