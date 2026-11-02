"use server";

import { revalidatePath } from "next/cache";
import type { BookingStatus, PaymentStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { hhmmToMin } from "@/lib/format";
import { str } from "@/lib/form";
import { notify } from "@/lib/notify";
import { dateTimeLabel, istToUtc } from "@/lib/time";

async function guard(id: string) {
  const user = await requireArea("bookings");
  const b = await db.booking.findUnique({ where: { id } });
  if (!b || (user.role === "DOCTOR" && user.doctorId && b.doctorId !== user.doctorId)) throw new Error("Not allowed");
  return b;
}

export async function setBookingStatus(id: string, status: BookingStatus) {
  const b = await guard(id);
  await db.booking.update({ where: { id }, data: { status } });
  if (status === "CANCELLED") await notify({ kind: "booking.cancelled", number: b.number, phone: b.phone, email: b.email, text: "Your consultation has been cancelled." });
  revalidatePath("/admin/bookings");
}

export async function setBookingPayment(id: string, paymentStatus: PaymentStatus) {
  const b = await guard(id);
  await db.booking.update({ where: { id }, data: { paymentStatus, ...(paymentStatus === "PAID" && b.status === "PENDING_PAYMENT" ? { status: "CONFIRMED" } : {}) } });
  revalidatePath("/admin/bookings");
}

export async function rescheduleBooking(id: string, f: FormData) {
  const b = await guard(id);
  const date = str(f, "date");
  const time = str(f, "time");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return;
  const startsAt = istToUtc(date, hhmmToMin(time));
  await db.booking.update({ where: { id }, data: { startsAt, status: b.status === "CANCELLED" ? "CONFIRMED" : b.status } });
  await notify({ kind: "booking.rescheduled", number: b.number, phone: b.phone, email: b.email, text: `Your consultation is moved to ${dateTimeLabel(startsAt)}.` });
  revalidatePath("/admin/bookings");
}

export async function setMeetingLink(id: string, f: FormData) {
  await guard(id);
  await db.booking.update({ where: { id }, data: { meetingLink: str(f, "meetingLink") || null } });
  revalidatePath("/admin/bookings");
}
