import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { addDays, dateTimeLabel, istToUtc, todayIST, utcToIst } from "@/lib/time";
import { minToHHMM } from "@/lib/format";
import { PageHeader, Pill } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { rescheduleBooking, setBookingPayment, setBookingStatus, setMeetingLink } from "./actions";

type SP = Promise<{ view?: string; doctor?: string }>;
const STATUS_TONE = { CONFIRMED: "green", PENDING_PAYMENT: "amber", COMPLETED: "blue", CANCELLED: "red", NO_SHOW: "grey" } as const;
const STATUS_LABEL = { CONFIRMED: "Confirmed", PENDING_PAYMENT: "Awaiting payment", COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No-show" } as const;

export default async function BookingsPage({ searchParams }: { searchParams: SP }) {
  const user = await requireArea("bookings");
  const { view = "upcoming", doctor } = await searchParams;
  const today = todayIST();
  const doctorFilter = user.role === "DOCTOR" && user.doctorId ? user.doctorId : doctor;

  const where: Prisma.BookingWhereInput = {
    ...(doctorFilter ? { doctorId: doctorFilter } : {}),
    ...(view === "today"
      ? { startsAt: { gte: istToUtc(today, 0), lt: istToUtc(addDays(today, 1), 0) } }
      : view === "past"
        ? { startsAt: { lt: new Date() } }
        : view === "cancelled"
          ? { status: "CANCELLED" }
          : { startsAt: { gte: istToUtc(today, 0) }, status: { not: "CANCELLED" } }),
  };
  const [bookings, doctors] = await Promise.all([
    db.booking.findMany({ where, include: { doctor: true, type: true }, orderBy: { startsAt: view === "past" ? "desc" : "asc" }, take: 200 }),
    db.doctor.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const views = [["upcoming", "Upcoming"], ["today", "Today"], ["past", "Past"], ["cancelled", "Cancelled"]];
  const qs = (v: string, d?: string) => `/admin/bookings?view=${v}${d ? `&doctor=${d}` : ""}`;

  return (
    <>
      <PageHeader title="Consultations" subtitle="Private — visible only to doctors and admins." />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#e3eae5] p-1">
          {views.map(([k, l]) => (
            <Link key={k} href={qs(k, doctor)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === k ? "bg-white" : "text-[#56685d]"}`}>{l}</Link>
          ))}
        </div>
        {user.role !== "DOCTOR" && (
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#e3eae5] p-1">
            <Link href={qs(view)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${!doctor ? "bg-white" : "text-[#56685d]"}`}>All doctors</Link>
            {doctors.map((d) => (
              <Link key={d.id} href={qs(view, d.id)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${doctor === d.id ? "bg-white" : "text-[#56685d]"}`}>{d.name}</Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {bookings.map((b) => {
          const ist = utcToIst(b.startsAt);
          return (
            <details key={b.id} className="a-card">
              <summary className="grid cursor-pointer gap-2 sm:grid-cols-[180px_1fr_160px_150px] sm:items-center">
                <span className="font-semibold">{dateTimeLabel(b.startsAt)}</span>
                <span>
                  <span className="font-semibold">{b.name}</span>, {b.age} · {b.concern}
                  <span className="block text-sm text-[#56685d]">{b.type.name} · {b.doctor.name} · #{b.number}</span>
                </span>
                <a href={`https://wa.me/91${b.phone}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#2e6b47]">+91 {b.phone}</a>
                <span className="flex flex-wrap gap-1.5">
                  <Pill tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Pill>
                  {b.fee ? <Pill tone={b.paymentStatus === "PAID" ? "green" : "amber"}>{b.paymentStatus === "PAID" ? "Paid" : `Unpaid ${inr(b.fee)}`}</Pill> : null}
                </span>
              </summary>
              <div className="mt-4 grid gap-4 border-t border-[#e8eeea] pt-4 lg:grid-cols-3">
                <div className="text-sm leading-6">
                  {b.email && <p>Email: {b.email}</p>}
                  {b.notes && <p className="mt-1 rounded-lg bg-[#f3f6f4] p-2">“{b.notes}”</p>}
                  <p className="mt-1 text-[#56685d]">Booked {b.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="a-label">Update</p>
                  <div className="flex flex-wrap gap-2">
                    {b.status !== "COMPLETED" && <form action={setBookingStatus.bind(null, b.id, "COMPLETED")}><button className="a-btn-ghost h-9">Mark completed</button></form>}
                    {b.status !== "NO_SHOW" && <form action={setBookingStatus.bind(null, b.id, "NO_SHOW")}><button className="a-btn-ghost h-9">No-show</button></form>}
                    {b.fee && b.paymentStatus !== "PAID" ? <form action={setBookingPayment.bind(null, b.id, "PAID")}><button className="a-btn-ghost h-9">Mark paid</button></form> : null}
                    {b.status !== "CANCELLED" && <form action={setBookingStatus.bind(null, b.id, "CANCELLED")}><button className="a-btn-danger h-9">Cancel</button></form>}
                  </div>
                  {b.type.key === "video" && (
                    <form action={setMeetingLink.bind(null, b.id)} className="mt-2 flex gap-2">
                      <label htmlFor={`ml-${b.id}`} className="sr-only">Video link</label>
                      <input id={`ml-${b.id}`} name="meetingLink" defaultValue={b.meetingLink ?? ""} placeholder="Video call link" className="a-input h-9" />
                      <SubmitButton className="a-btn-ghost h-9">Save</SubmitButton>
                    </form>
                  )}
                </div>
                <form action={rescheduleBooking.bind(null, b.id)} className="flex flex-col gap-2">
                  <p className="a-label">Reschedule</p>
                  <div className="flex flex-wrap gap-2">
                    <label htmlFor={`rd-${b.id}`} className="sr-only">New date</label>
                    <input id={`rd-${b.id}`} name="date" type="date" defaultValue={ist.date} className="a-input h-9 w-40" />
                    <label htmlFor={`rt-${b.id}`} className="sr-only">New time</label>
                    <input id={`rt-${b.id}`} name="time" type="time" defaultValue={minToHHMM(ist.min)} step={300} className="a-input h-9 w-32" />
                    <SubmitButton className="a-btn h-9">Move</SubmitButton>
                  </div>
                </form>
              </div>
            </details>
          );
        })}
        {!bookings.length && <p className="a-card text-center text-[#56685d]">No consultations here.</p>}
      </div>
    </>
  );
}
