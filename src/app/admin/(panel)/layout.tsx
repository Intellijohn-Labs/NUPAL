import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, ROLE_AREAS, ROLE_LABELS } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", area: "dashboard" },
  { href: "/admin/orders", label: "Orders", area: "orders" },
  { href: "/admin/bookings", label: "Consultations", area: "bookings" },
  { href: "/admin/products", label: "Products", area: "products" },
  { href: "/admin/concerns", label: "Health concerns", area: "concerns" },
  { href: "/admin/doctors", label: "Doctors & timings", area: "doctors" },
  { href: "/admin/reviews", label: "Reviews", area: "reviews" },
  { href: "/admin/results", label: "Real results", area: "results" },
  { href: "/admin/testimonials", label: "Video testimonials", area: "testimonials" },
  { href: "/admin/banners", label: "Homepage banners", area: "banners" },
  { href: "/admin/pages", label: "Pages & policies", area: "pages" },
  { href: "/admin/menus", label: "Menus", area: "pages" },
  { href: "/admin/settings", label: "Store settings", area: "settings" },
  { href: "/admin/staff", label: "Staff & access", area: "staff" },
] as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const areas = ROLE_AREAS[user.role];
  const items = NAV.filter((n) => areas.includes(n.area));

  return (
    <div className="min-h-screen bg-[#f3f6f4] font-sans text-[#15241b] lg:flex">
      <Sidebar items={[...items]} userName={user.name} roleLabel={ROLE_LABELS[user.role]} logout={logout} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
