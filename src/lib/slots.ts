import { db } from "./db";
import { addDays, istToUtc, todayIST, utcToIst, weekdayOf, IST_OFFSET_MIN } from "./time";

export type Slot = { min: number; doctorIds: string[] };

/** Minimum notice before a slot can be booked. */
const LEAD_MIN = 60;

/**
 * Open slots for one IST date. If doctorId is "any", slots from all active doctors are merged,
 * and each slot lists the doctors who are free at that time.
 */
export async function getSlots(date: string, typeId: string, doctorId: string | "any"): Promise<Slot[]> {
  const type = await db.consultationType.findUnique({ where: { id: typeId } });
  if (!type || !type.active) return [];

  const doctors = await db.doctor.findMany({
    where: { active: true, ...(doctorId !== "any" ? { id: doctorId } : {}) },
    include: {
      availability: { where: { weekday: weekdayOf(date) } },
      leaves: { where: { date } },
    },
  });

  const dayStart = istToUtc(date, 0);
  const dayEnd = istToUtc(addDays(date, 1), 0);
  const bookings = await db.booking.findMany({
    where: {
      doctorId: { in: doctors.map((d) => d.id) },
      startsAt: { gte: dayStart, lt: dayEnd },
      status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
    },
    select: { doctorId: true, startsAt: true, durationMin: true },
  });

  // Earliest bookable minute today (IST), with notice period.
  const now = new Date();
  const nowIst = utcToIst(now);
  const earliest = date === todayIST(now) ? nowIst.min + LEAD_MIN : date < todayIST(now) ? Infinity : 0;

  const byMin = new Map<number, string[]>();
  for (const doc of doctors) {
    if (doc.leaves.length) continue;
    const busy = bookings
      .filter((b) => b.doctorId === doc.id)
      .map((b) => {
        const s = utcToIst(b.startsAt).min;
        return [s, s + b.durationMin] as const;
      });
    for (const a of doc.availability) {
      for (let m = a.startMin; m + type.durationMin <= a.endMin; m += type.durationMin) {
        if (m < earliest) continue;
        const end = m + type.durationMin;
        if (busy.some(([s, e]) => m < e && end > s)) continue;
        byMin.set(m, [...(byMin.get(m) ?? []), doc.id]);
      }
    }
  }
  return [...byMin.entries()].sort((a, b) => a[0] - b[0]).map(([min, doctorIds]) => ({ min, doctorIds }));
}

/** Dates (next N days) on which at least one chosen doctor works and is not on leave. */
export async function getOpenDates(doctorId: string | "any", days = 14) {
  const doctors = await db.doctor.findMany({
    where: { active: true, ...(doctorId !== "any" ? { id: doctorId } : {}) },
    include: { availability: true, leaves: true },
  });
  const start = todayIST();
  const out: { date: string; open: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const wd = weekdayOf(date);
    const open = doctors.some((d) => d.availability.some((a) => a.weekday === wd) && !d.leaves.some((l) => l.date === date));
    out.push({ date, open });
  }
  return out;
}

export { IST_OFFSET_MIN };
