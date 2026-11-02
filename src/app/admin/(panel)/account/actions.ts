"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { str } from "@/lib/form";

export async function changePassword(_prev: string | null, f: FormData): Promise<string | null> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (!(await bcrypt.compare(str(f, "current"), user.passwordHash))) return "Your current password is incorrect.";
  const next = str(f, "next");
  if (next.length < 8) return "New password must be at least 8 characters.";
  if (next !== str(f, "confirm")) return "The new passwords don’t match.";
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return "OK";
}
