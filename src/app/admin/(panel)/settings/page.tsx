import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Flash, PageHeader } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { deleteSocialLink, saveConsultTypes, saveSettings, saveSocialLink } from "./actions";
import { PLATFORMS } from "@/components/store/SocialIcon";
import { ConfirmButton } from "@/components/admin/ui";

function F({ id, label, help, ...rest }: { id: string; label: string; help?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="a-label">{label}</label>
      <input id={id} name={id} className="a-input" {...rest} />
      {help && <p className="a-help">{help}</p>}
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireArea("settings");
  const { saved } = await searchParams;
  const [s, types, socials] = await Promise.all([
    getSettings(),
    db.consultationType.findMany({ orderBy: { sortOrder: "asc" } }),
    db.socialLink.findMany({ orderBy: [{ platform: "asc" }, { sortOrder: "asc" }] }),
  ]);

  return (
    <>
      <PageHeader title="Store settings" />
      <Flash show={saved === "1"}>Settings saved.</Flash>
      <Flash show={saved === "consult"}>Consultation types saved.</Flash>
      <Flash show={saved === "social"}>Social media links saved.</Flash>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <form action={saveSettings} className="flex flex-col gap-5">
          <section className="a-card flex flex-col gap-4">
            <h2 className="font-sans text-lg font-semibold">Offer bar</h2>
            <div>
              <label htmlFor="offerMessages" className="a-label">Messages (one per line)</label>
              <textarea id="offerMessages" name="offerMessages" rows={5} defaultValue={s.offerMessages.join("\n")} className="a-textarea" />
              <p className="a-help">These scroll across the top of every page. Leave empty to hide the bar.</p>
            </div>
          </section>
          <section className="a-card grid gap-4 sm:grid-cols-2">
            <h2 className="font-sans text-lg font-semibold sm:col-span-2">Real results section</h2>
            <F id="resultsCount" label="Number shown in the counter" inputMode="numeric" defaultValue={s.resultsCount} help="Shown as “10,000+ hair regrowth results”." />
            <F id="resultsHook" label="Headline" defaultValue={s.resultsHook} />
          </section>
          {(() => {
            const h = (s.heritage && typeof s.heritage === "object" && !Array.isArray(s.heritage) ? s.heritage : {}) as {
              show?: boolean; eyebrow?: string; title?: string; quote?: string; body?: string; year?: number | null;
              stats?: { value: number | string; suffix: string; label: string }[]; certs?: string[]; ctaLabel?: string; ctaHref?: string;
            };
            return (
              <section className="a-card flex flex-col gap-3">
                <h2 className="font-sans text-lg font-semibold">“Why Nupal” section (homepage)</h2>
                <p className="text-sm text-[#56685d]">The short story beside NUPAL’s DNA illustration, with three facts and the certificate badges. The four cards below it use the “Why NUPAL” points.</p>
                <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="her_show" defaultChecked={h.show !== false} className="h-5 w-5 accent-[#2e6b47]" />Show on the homepage</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <F id="her_eyebrow" label="Small line above the title" defaultValue={h.eyebrow ?? ""} />
                  <F id="her_year" label="“Since” year on the seal" inputMode="numeric" defaultValue={h.year ?? ""} />
                </div>
                <div><label htmlFor="her_title" className="a-label">Title</label><textarea id="her_title" name="her_title" rows={2} defaultValue={h.title ?? ""} className="a-textarea" /><p className="a-help">Press Enter to choose where the second line starts.</p></div>
                <div><label htmlFor="her_quote" className="a-label">Quote</label><input id="her_quote" name="her_quote" defaultValue={h.quote ?? ""} className="a-input" /></div>
                <div><label htmlFor="her_body" className="a-label">Text</label><textarea id="her_body" name="her_body" rows={3} defaultValue={h.body ?? ""} className="a-textarea" /></div>
                <p className="a-label mb-0">Three short facts (a plain number counts up on screen)</p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="grid grid-cols-[90px_70px_1fr] gap-2">
                    <input aria-label={`Fact ${i + 1}`} name={`her_sv_${i}`} defaultValue={h.stats?.[i]?.value ?? ""} placeholder="1960" className="a-input" />
                    <input aria-label={`After number ${i + 1}`} name={`her_ss_${i}`} defaultValue={h.stats?.[i]?.suffix ?? ""} placeholder="+" className="a-input" />
                    <input aria-label={`Label ${i + 1}`} name={`her_sl_${i}`} defaultValue={h.stats?.[i]?.label ?? ""} placeholder="Years of practice" className="a-input" />
                  </div>
                ))}
                <F id="her_certs" label="Certificates (comma separated)" defaultValue={(h.certs ?? []).join(", ")} help="Shown as badges, e.g. GMP, WHO-GMP, ISO 9001, AYUSH. Only list certificates NUPAL holds." />
                <div className="grid gap-3 sm:grid-cols-2">
                  <F id="her_cta" label="Button text" defaultValue={h.ctaLabel ?? ""} />
                  <F id="her_href" label="Button link" defaultValue={h.ctaHref ?? ""} />
                </div>
              </section>
            );
          })()}
          <section className="a-card flex flex-col gap-3">
            <h2 className="font-sans text-lg font-semibold">Homepage banner chips and collections</h2>
            <p className="a-label mb-0">Trust chips in the banner (up to 3)</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <input key={i} aria-label={`Chip ${i + 1}`} name={`chip_${i}`} defaultValue={s.heroChips[i] ?? ""} placeholder="Cash on Delivery" className="a-input" />
              ))}
            </div>
            <p className="a-label mb-0 mt-2">Two collection cards</p>
            {[0, 1].map((i) => {
              const c = ((Array.isArray(s.homeCollections) ? s.homeCollections : []) as { title?: string; text?: string; href?: string }[])[i] ?? {};
              return (
                <div key={i} className="grid gap-2 rounded-xl border border-[#e8eeea] p-3 sm:grid-cols-[1fr_1.4fr_160px]">
                  <input aria-label={`Collection ${i + 1} title`} name={`col_t_${i}`} defaultValue={c.title ?? ""} placeholder="Everyday Wellness" className="a-input" />
                  <input aria-label={`Collection ${i + 1} text`} name={`col_x_${i}`} defaultValue={c.text ?? ""} placeholder="One short line" className="a-input" />
                  <input aria-label={`Collection ${i + 1} link`} name={`col_h_${i}`} defaultValue={c.href ?? ""} placeholder="/shop?type=Capsule" className="a-input" />
                </div>
              );
            })}
            <div className="mt-2"><label htmlFor="footerLegal" className="a-label">Footer legal line</label><textarea id="footerLegal" name="footerLegal" rows={2} defaultValue={s.footerLegal} placeholder="Drug licence no. …  This information is not a substitute for medical advice." className="a-textarea" /></div>
          </section>
          <section className="a-card flex flex-col gap-3">
            <h2 className="font-sans text-lg font-semibold">“Why NUPAL” points</h2>
            <p className="text-sm text-[#56685d]">The short strip near the bottom of the homepage. Up to 4 points; leave all empty to hide it.</p>
            {[0, 1, 2, 3].map((i) => {
              const w = (Array.isArray(s.whyPoints) ? (s.whyPoints as { title?: string; text?: string }[]) : [])[i] ?? {};
              return (
                <div key={i} className="grid gap-2 rounded-xl border border-[#e8eeea] p-3 sm:grid-cols-[1fr_1.4fr]">
                  <div><label htmlFor={`why_title_${i}`} className="a-label">Point {i + 1}</label><input id={`why_title_${i}`} name={`why_title_${i}`} defaultValue={w.title ?? ""} placeholder="e.g. Cash on delivery" className="a-input" /></div>
                  <div><label htmlFor={`why_text_${i}`} className="a-label">Short line</label><input id={`why_text_${i}`} name={`why_text_${i}`} defaultValue={w.text ?? ""} placeholder="e.g. Pay when your order arrives" className="a-input" /></div>
                </div>
              );
            })}
          </section>
          <section className="a-card grid gap-4 sm:grid-cols-2">
            <h2 className="font-sans text-lg font-semibold sm:col-span-2">Delivery and cash on delivery</h2>
            <F id="shippingFee" label="Delivery charge (₹)" inputMode="numeric" defaultValue={s.shippingFee} />
            <F id="freeShippingAbove" label="Free delivery above (₹)" inputMode="numeric" defaultValue={s.freeShippingAbove ?? ""} help="Leave empty for no free delivery." />
            <F id="codCharge" label="COD charge (₹)" inputMode="numeric" defaultValue={s.codCharge} />
            <F id="codMaxOrder" label="Maximum COD order (₹)" inputMode="numeric" defaultValue={s.codMaxOrder ?? ""} help="Leave empty for no limit." />
            <label className="flex items-center gap-3 text-[15px] sm:col-span-2"><input type="checkbox" name="codEnabled" defaultChecked={s.codEnabled} className="h-5 w-5 accent-[#2e6b47]" />Accept cash on delivery orders</label>
          </section>
          <section className="a-card grid gap-4 sm:grid-cols-2">
            <h2 className="font-sans text-lg font-semibold sm:col-span-2">Business and contact</h2>
            <F id="legalName" label="Legal business name" defaultValue={s.legalName} />
            <F id="gstin" label="GSTIN" defaultValue={s.gstin} />
            <div className="sm:col-span-2">
              <label htmlFor="address" className="a-label">Address</label>
              <textarea id="address" name="address" rows={2} defaultValue={s.address} className="a-textarea" />
            </div>
            <F id="phone" label="Phone" defaultValue={s.phone} />
            <F id="customerCareHours" label="Customer care" defaultValue={s.customerCareHours} placeholder="90617 70099 (9 AM – 5 PM)" />
            <F id="email" label="Email" type="email" defaultValue={s.email} />
            <F id="whatsappNumber" label="WhatsApp number" defaultValue={s.whatsappNumber} help="With country code, e.g. 919061770099. Powers the green chat button." />
          </section>
          <div><SubmitButton className="a-btn h-11">Save settings</SubmitButton></div>
        </form>

        <form action={saveConsultTypes} className="a-card flex flex-col gap-4">
          <h2 className="font-sans text-lg font-semibold">Consultation types and fees</h2>
          {types.map((t) => (
            <div key={t.id} className="grid gap-3 rounded-xl border border-[#e8eeea] p-3 sm:grid-cols-2">
              <input type="hidden" name="ct_id" value={t.id} />
              <F id={`name_${t.id}`} label="Name" defaultValue={t.name} />
              <F id={`desc_${t.id}`} label="Short note" defaultValue={t.description} />
              <F id={`dur_${t.id}`} label="Length (minutes)" inputMode="numeric" defaultValue={t.durationMin} />
              <F id={`fee_${t.id}`} label="Fee (₹)" inputMode="numeric" defaultValue={t.fee ?? ""} help="0 = free. Empty = “fee confirmed on booking”." />
              <label className="flex items-center gap-3 text-[15px]"><input type="checkbox" name={`active_${t.id}`} defaultChecked={t.active} className="h-5 w-5 accent-[#2e6b47]" />Offer this type</label>
            </div>
          ))}
          <div><SubmitButton>Save consultation types</SubmitButton></div>
        </form>
      </div>

      <section id="social" className="a-card mt-5 scroll-mt-6">
        <h2 className="font-sans text-lg font-semibold">Social media</h2>
        <p className="mt-1 text-sm text-[#56685d]">
          Tick <span className="font-semibold">Main account</span> for the one account per platform shown in the footer of every page. All shown accounts are listed on the Contact Us page.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {socials.map((l) => (
            <div key={l.id} className="rounded-xl border border-[#e8eeea] p-3">
              <form action={saveSocialLink.bind(null, l.id)} className="grid gap-3 md:grid-cols-[150px_1fr_1.4fr_80px] md:items-end">
                <div>
                  <label htmlFor={`pl-${l.id}`} className="a-label">Platform</label>
                  <select id={`pl-${l.id}`} name="platform" defaultValue={l.platform} className="a-input">
                    {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label htmlFor={`lb-${l.id}`} className="a-label">Account name</label><input id={`lb-${l.id}`} name="label" defaultValue={l.label} className="a-input" /></div>
                <div><label htmlFor={`u-${l.id}`} className="a-label">Link</label><input id={`u-${l.id}`} name="url" required defaultValue={l.url} className="a-input" /></div>
                <div><label htmlFor={`so-${l.id}`} className="a-label">Order</label><input id={`so-${l.id}`} name="sortOrder" inputMode="numeric" defaultValue={l.sortOrder} className="a-input" /></div>
                <div className="flex flex-wrap items-center gap-4 md:col-span-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="inFooter" defaultChecked={l.inFooter} className="h-5 w-5 accent-[#2e6b47]" />Main account (show in footer)</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={l.active} className="h-5 w-5 accent-[#2e6b47]" />Show on website</label>
                  <span className="flex-1" />
                  <SubmitButton className="a-btn-ghost">Save</SubmitButton>
                </div>
              </form>
              <form action={deleteSocialLink.bind(null, l.id)} className="mt-2">
                <ConfirmButton message="Remove this social link?" className="text-sm font-semibold text-[#a3361f]">Remove</ConfirmButton>
              </form>
            </div>
          ))}
          {!socials.length && <p className="text-sm text-[#56685d]">No social links yet.</p>}
        </div>
        <form action={saveSocialLink.bind(null, null)} className="mt-5 grid gap-3 rounded-xl bg-[#f3f6f4] p-3 md:grid-cols-[150px_1fr_1.4fr_auto] md:items-end">
          <div>
            <label htmlFor="pl-new" className="a-label">Platform</label>
            <select id="pl-new" name="platform" defaultValue="facebook" className="a-input">
              {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label htmlFor="lb-new" className="a-label">Account name</label><input id="lb-new" name="label" placeholder="e.g. NUPAL Clinic" className="a-input" /></div>
          <div><label htmlFor="u-new" className="a-label">Link</label><input id="u-new" name="url" required placeholder="https://facebook.com/…" className="a-input" /></div>
          <input type="hidden" name="active" value="on" />
          <input type="hidden" name="sortOrder" value={socials.length + 1} />
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="inFooter" className="h-5 w-5 accent-[#2e6b47]" />Main account</label>
            <SubmitButton>+ Add social link</SubmitButton>
          </div>
        </form>
      </section>
    </>
  );
}
