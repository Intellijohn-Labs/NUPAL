"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSlots } from "@/lib/slots";
import { dateTimeLabel, istToUtc, todayIST } from "@/lib/time";
import { notify } from "@/lib/notify";

const schema = z.object({
  typeId: z.string().min(1),
  doctorId: z.string().min(1), // doctor id or "any"
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  min: z.number().int().min(0).max(1439),
  name: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number."),
  age: z.number({ invalid_type_error: "Enter your age." }).int().min(0, "Enter your age.").max(120, "Enter your age."),
  concern: z.string().trim().min(2, "Choose your main health concern."),
  email: z.string().trim().email("Enter a valid email, or leave it empty.").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
});

export type BookingInput = z.infer<typeof schema>;
export type BookingResult =
  | { ok: true; number: number; doctor: string; type: string; when: string; fee: number | null; status: string }
  | { ok: false; error: string };

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.date < todayIST()) return { ok: false, error: "Please pick a date from today onwards." };

  const type = await db.consultationType.findUnique({ where: { id: d.typeId } });
  if (!type || !type.active) return { ok: false, error: "This consultation type is not available. Please choose another." };

  const slots = await getSlots(d.date, d.typeId, d.doctorId);
  const slot = slots.find((s) => s.min === d.min);
  if (!slot) return { ok: false, error: "Sorry, that time was just taken. Please pick another slot." };
  const doctorId = d.doctorId === "any" ? slot.doctorIds[0] : d.doctorId;
  const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return { ok: false, error: "Doctor not found." };

  const paid = type.fee != null && type.fee > 0;
  const booking = await db.booking.create({
    data: {
      doctorId,
      typeId: type.id,
      startsAt: istToUtc(d.date, d.min),
      durationMin: type.durationMin,
      name: d.name,
      phone: d.phone,
      age: d.age,
      concern: d.concern,
      email: d.email || null,
      notes: d.notes || null,
      fee: type.fee,
      status: paid ? "PENDING_PAYMENT" : "CONFIRMED",
    },
  });
  const when = dateTimeLabel(booking.startsAt);
  await notify({
    kind: "booking.created",
    number: booking.number,
    phone: booking.phone,
    email: booking.email,
    text: `${type.name} with ${doctor.name} on ${when}`,
  });
  return { ok: true, number: booking.number, doctor: doctor.name, type: type.name, when, fee: type.fee, status: booking.status };
}
