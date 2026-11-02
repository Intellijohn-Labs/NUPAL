import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { productTypes } from "@/lib/catalog";
import { CartProvider } from "@/components/store/CartProvider";
import { Header } from "@/components/store/Header";
import { OfferBar } from "@/components/store/OfferBar";
import { Footer } from "@/components/store/Footer";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, concerns, types, pages, socials, menus] = await Promise.all([
    getSettings(),
    db.concern.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
    productTypes(),
    db.page.findMany({ where: { published: true, inFooter: true }, orderBy: { title: "asc" }, select: { title: true, slug: true } }),
    db.socialLink.findMany({ where: { active: true, inFooter: true }, orderBy: { sortOrder: "asc" }, select: { id: true, platform: true, label: true, url: true } }),
    db.menuGroup.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, items: { orderBy: { sortOrder: "asc" }, select: { id: true, label: true, href: true } } } }),
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
