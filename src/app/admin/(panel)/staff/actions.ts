"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, str } from "@/lib/form";

const ROLES: Role[] = ["OWNER", "ADMIN", "DOCTOR", "ORDERS", "CONTENT"];

export async function createStaff(_prev: string | null, f: FormData): Promise<string | null> {
  await requireArea("staff");
  const email = str(f, "email").toLowerCase();
  const password = str(f, "password");
  const role = str(f, "role") as Role;
  if (!str(f, "name") || !email) return "Enter a name and email.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!ROLES.includes(role)) return "Choose a role.";
  if (await db.user.findUnique({ where: { email } })) return "A staff member with this email already exists.";
  await db.user.create({
    data: { name: str(f, "name"), email, role, passwordHash: await bcrypt.hash(password, 10), doctorId: role === "DOCTOR" ? str(f, "doctorId") || null : null },
  });
  revalidatePath("/admin/staff");
  return "OK";
}

export async function updateStaff(id: string, f: FormData) {
  const me = await requireArea("staff");
  const role = str(f, "role") as Role;
  const active = bool(f, "active");
  if (id === me.id && (!active || role !== "OWNER")) return; // can't lock yourself out
  const password = str(f, "password");
  await db.user.update({
    where: { id },
    data: {
      role: ROLES.includes(role) ? role : undefined,
      active,
      doctorId: role === "DOCTOR" ? str(f, "doctorId") || null : null,
      ...(password.length >= 8 ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });
  revalidatePath("/admin/staff");
}
