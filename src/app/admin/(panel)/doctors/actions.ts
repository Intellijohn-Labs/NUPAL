"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { hhmmToMin, slugify } from "@/lib/format";
import { bool, collectImages, int, list, str } from "@/lib/form";

export async function saveDoctor(id: string | null, f: FormData) {
  await requireArea("doctors");
  const name = str(f, "name");
  if (!name) return;
  const [photo] = await collectImages(f, "photo", "doctors");
  let slug = slugify(name);
  if (await db.doctor.findFirst({ where: { slug, NOT: id ? { id } : undefined } })) slug = `${slug}-${Date.now().toString(36)}`;
  const data = {
    name,
    slug,
    qualifications: str(f, "qualifications") || "BAMS",
    experience: str(f, "experience"),
    specialities: list(f, "specialities"),
    languages: list(f, "languages"),
    bio: str(f, "bio"),
    photo: photo ?? null,
    active: bool(f, "active"),
    sortOrder: int(f, "sortOrder"),
  };
  const doc = id ? await db.doctor.update({ where: { id }, data }) : await db.doctor.create({ data });
  revalidatePath("/", "layout");
  redirect(`/admin/doctors/${doc.id}?saved=profile`);
}

export async function saveAvailability(doctorId: string, f: FormData) {
  await requireArea("doctors");
  const days = f.getAll("a_day").map(Number);
  const starts = f.getAll("a_start").map(String);
  const ends = f.getAll("a_end").map(String);
  const rows = days
    .map((weekday, i) => ({ doctorId, weekday, startMin: hhmmToMin(starts[i]), endMin: hhmmToMin(ends[i]) }))
    .filter((r) => r.endMin > r.startMin);
  await db.$transaction([db.availability.deleteMany({ where: { doctorId } }), db.availability.createMany({ data: rows })]);
  revalidatePath("/consult");
  redirect(`/admin/doctors/${doctorId}?saved=hours`);
}

export async function addLeave(doctorId: string, f: FormData) {
  await requireArea("doctors");
  const from = str(f, "from");
  const to = str(f, "to") || from;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || to < from) return;
  const dates: string[] = [];
  for (let d = new Date(from + "T00:00:00Z"); d.toISOString().slice(0, 10) <= to && dates.length < 60; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  await db.leave.createMany({ data: dates.map((date) => ({ doctorId, date, note: str(f, "note") || null })), skipDuplicates: true });
  revalidatePath(`/admin/doctors/${doctorId}`);
}

export async function removeLeave(id: string, doctorId: string) {
  await requireArea("doctors");
  await db.leave.delete({ where: { id } });
  revalidatePath(`/admin/doctors/${doctorId}`);
}
