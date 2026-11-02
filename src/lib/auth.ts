import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { SESSION_COOKIE, verifySession } from "./session";

export type Area =
  | "dashboard"
  | "orders"
  | "products"
  | "concerns"
  | "doctors"
  | "bookings"
  | "banners"
  | "pages"
  | "reviews"
  | "testimonials"
  | "results"
  | "settings"
  | "staff";

const ALL: Area[] = ["dashboard", "orders", "products", "concerns", "doctors", "bookings", "banners", "pages", "reviews", "testimonials", "results", "settings", "staff"];

export const ROLE_AREAS: Record<Role, Area[]> = {
  OWNER: ALL,
  ADMIN: ALL.filter((a) => a !== "staff"),
  DOCTOR: ["bookings", "doctors"],
  ORDERS: ["dashboard", "orders"],
  CONTENT: ["dashboard", "products", "concerns", "banners", "pages", "reviews", "testimonials", "results"],
};

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  ORDERS: "Order staff",
  CONTENT: "Content staff",
};

export async function currentUser() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.uid } });
  if (!user || !user.active) return null;
  return user;
}

/** Use at the top of every admin page and server action. */
export async function requireArea(area: Area) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (!ROLE_AREAS[user.role].includes(area)) redirect("/admin?denied=" + area);
  return user;
}

export const can = (role: Role, area: Area) => ROLE_AREAS[role].includes(area);
