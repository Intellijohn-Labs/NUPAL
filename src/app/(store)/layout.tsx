import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { productTypes } from "@/lib/catalog";
import { CartProvider } from "@/components/store/CartProvider";
import { Header } from "@/components/store/Header";
import { OfferBar } from "@/components/store/OfferBar";
import { Footer } from "@/components/store/Footer";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";

export const dynamic = "force-dynamic";

/** “About us ▾”: the About page’s titled sections, then pages ticked “Show in the About us menu”, then Testimonials. */
async function aboutMenu() {
  const [about, pages] = await Promise.all([
    db.page.findUnique({
      where: { slug: "about-us" },
      select: { published: true, title: true, blocks: { where: { anchor: { not: "" }, title: { not: "" } }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true, anchor: true } } },
    }),
    db.page.findMany({ where: { published: true, inAboutMenu: true, slug: { not: "about-us" } }, orderBy: { title: "asc" }, select: { id: true, title: true, slug: true } }),
  ]);
  const items = [
    ...(about?.published ? (about.blocks.length ? about.blocks.map((b) => ({ id: b.id, label: b.title, href: `/about-us#${b.anchor}` })) : [{ id: "about", label: about.title, href: "/about-us" }]) : []),
    ...pages.map((p) => ({ id: p.id, label: p.title, href: `/${p.slug}` })),
    { id: "testimonials", label: "Testimonials", href: "/stories" },
  ];
  return [{ id: "about", name: "About us", items }];
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, concerns, types, pages, socials, menus] = await Promise.all([
    getSettings(),
    db.concern.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
    productTypes(),
    db.page.findMany({ where: { published: true, inFooter: true }, orderBy: { title: "asc" }, select: { title: true, slug: true } }),
    db.socialLink.findMany({ where: { active: true, inFooter: true }, orderBy: { sortOrder: "asc" }, select: { id: true, platform: true, label: true, url: true } }),
    aboutMenu(),
  ]);

  return (
    <CartProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <OfferBar messages={settings.offerMessages} />
      <Header concerns={concerns} types={types} menus={menus.filter((m) => m.items.length)} />
      <main id="main">{children}</main>
      <Footer concerns={concerns} pages={pages} settings={settings} socials={socials} />
      <WhatsAppFloat number={settings.whatsappNumber} />
    </CartProvider>
  );
}
