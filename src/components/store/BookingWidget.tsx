"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createBooking, type BookingResult } from "@/app/(store)/consult/actions";
import { inr, minToLabel } from "@/lib/format";
import { dateLabel } from "@/lib/time";

type Doctor = { id: string; name: string };
type CType = { id: string; key: string; name: string; description: string; durationMin: number; fee: number | null };

const ICONS: Record<string, string> = {
  video: "M3 6h13v12H3zM16 10l5-3v10l-5-3z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  clinic: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
};
const CONCERNS = ["Liver health", "Digestion & acidity", "Heart health", "Diabetes care", "Women’s health", "Hair", "Skin", "Cough & breathing", "Piles", "Joint pain", "Weight", "Other"];

export function BookingWidget({ doctors, types }: { doctors: Doctor[]; types: CType[] }) {
  const [step, setStep] = useState(1);
  const [doctorId, setDoctorId] = useState<string>("any");
  const [typeId, setTypeId] = useState<string>("");
  const [dates, setDates] = useState<{ date: string; open: boolean }[]>([]);
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<number[] | null>(null);
  const [min, setMin] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Extract<BookingResult, { ok: true }> | null>(null);
  const [pending, start] = useTransition();
  const type = types.find((t) => t.id === typeId);

  useEffect(() => {
    if (step !== 2) return;
    fetch(`/api/consult/dates?doctor=${doctorId}`)
      .then((r) => r.json())
      .then((d: { date: string; open: boolean }[]) => {
        setDates(d);
        if (!date) setDate(d.find((x) => x.open)?.date ?? "");
      });
  }, [step, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step !== 2 || !date || !typeId) return;
    setSlots(null);
    setMin(null);
    fetch(`/api/consult/slots?date=${date}&type=${typeId}&doctor=${doctorId}`)
      .then((r) => r.json())
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [step, date, typeId, doctorId]);

  function submit(form: FormData) {
    setError("");
    const get = (k: string) => String(form.get(k) ?? "");
    start(async () => {
      const res = await createBooking({
        typeId,
        doctorId,
        date,
        min: min ?? -1,
        name: get("name"),
        phone: get("phone").replace(/\D/g, "").slice(-10),
        age: Number(get("age")),
        concern: get("concern"),
        email: get("email"),
        notes: get("notes"),
      });
      if (!res.ok) return setError(res.error);
      setDone(res);
      setStep(4);
    });
  }

  const titles = ["", "How would you like to consult?", "Pick a date and time", "Your details", "You’re booked"];
  const progress = step === 4 ? 100 : step * 30;
  const morning = (slots ?? []).filter((m) => m < 14 * 60);
  const evening = (slots ?? []).filter((m) => m >= 14 * 60);
  const feeText = (fee: number | null) => (fee == null ? "Fee confirmed on booking" : fee === 0 ? "Free" : inr(fee));

  return (
    <section aria-label="Book a consultation" className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-36px_rgba(35,64,46,.55)] lg:sticky lg:top-28">
      <div className="flex flex-col gap-3 border-b border-line px-5 pb-4 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl">{titles[step]}</h2>
          <span className="text-sm text-muted">{step < 4 ? `Step ${step} of 3` : "Done"}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-sand">
          <div className="h-full rounded-full bg-sage transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {step === 1 && (
          <div className="fade-in flex flex-col gap-4">
            {doctors.length > 1 && (
              <div role="radiogroup" aria-label="Doctor" className="flex flex-wrap gap-2">
                {[{ id: "any", name: "First available" }, ...doctors].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={doctorId === d.id}
                    onClick={() => setDoctorId(d.id)}
                    className={`h-10 rounded-full border px-4 text-sm ${doctorId === d.id ? "border-sage bg-sage text-white" : "border-line"}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTypeId(t.id);
                  setStep(2);
                }}
                className="flex items-center gap-4 rounded-2xl border-[1.5px] border-line p-4 text-left transition-colors hover:border-sage"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E5A42" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                    <path d={ICONS[t.key] ?? ICONS.video} />
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="block text-[17px] font-medium">{t.name}</span>
                  <span className="text-sm text-muted">{t.durationMin} min{t.description ? ` · ${t.description}` : ""}</span>
                </span>
                <span className="text-right text-sm font-medium text-sage-dark">{feeText(t.fee)}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="fade-in flex flex-col gap-5">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Date">
              {dates.map((d, i) => {
                const [, , dd] = d.date.split("-");
                const label = dateLabel(d.date);
                return (
                  <button
                    key={d.date}
                    type="button"
                    role="radio"
                    aria-checked={date === d.date}
                    aria-label={`${label}${d.open ? "" : ", no slots"}`}
                    disabled={!d.open}
                    onClick={() => setDate(d.date)}
                    className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border-[1.5px] py-2 ${
                      date === d.date ? "border-sage bg-sage text-white" : d.open ? "border-line" : "border-transparent bg-[#f4f2ee] text-[#8a8f8b]"
                    }`}
                  >
                    <span className="text-xs">{i === 0 ? "Today" : label.slice(0, 3)}</span>
                    <span className="text-xl font-semibold">{Number(dd)}</span>
                    <span className="text-[10px]">{d.open ? label.split(" ")[2] : "Closed"}</span>
                  </button>
                );
              })}
            </div>
            {slots === null ? (
              <p className="text-muted">Loading open times…</p>
            ) : slots.length === 0 ? (
              <p className="rounded-xl bg-cream px-4 py-3 text-muted">No open times on this day. Please pick another date.</p>
            ) : (
              [
                ["Morning", morning],
                ["Afternoon & evening", evening],
              ].map(([label, list]) =>
                (list as number[]).length ? (
                  <div key={label as string}>
                    <p className="mb-2 text-sm font-medium text-muted">{label as string}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={label as string}>
                      {(list as number[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={min === m}
                          onClick={() => setMin(m)}
                          className={`h-11 rounded-xl border-[1.5px] text-sm font-medium ${min === m ? "border-sage bg-sage text-white" : "border-line hover:border-sage"}`}
                        >
                          {minToLabel(m)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null,
              )
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>Back</button>
              <button type="button" className="btn-primary flex-1" disabled={min == null} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form action={submit} className="fade-in grid grid-cols-2 gap-4">
            <p className="col-span-2 rounded-xl bg-mist px-4 py-3 text-sm">
              {type?.name} · {dateLabel(date)} · {min != null ? minToLabel(min) : ""} ·{" "}
              {doctorId === "any" ? "First available doctor" : doctors.find((d) => d.id === doctorId)?.name}
            </p>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="b-name" className="label">Full name</label>
              <input id="b-name" name="name" required autoComplete="name" className="field" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="b-phone" className="label">WhatsApp number</label>
              <div className="flex h-12 overflow-hidden rounded-xl border border-[#cfc5b0] focus-within:border-sage">
                <span className="flex items-center border-r border-[#cfc5b0] bg-cream px-3 text-muted">+91</span>
                <input id="b-phone" name="phone" required inputMode="numeric" autoComplete="tel-national" className="min-w-0 flex-1 px-3 outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="b-age" className="label">Age</label>
              <input id="b-age" name="age" required inputMode="numeric" className="field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="b-concern" className="label">Main concern</label>
              <select id="b-concern" name="concern" required defaultValue="" className="field">
                <option value="" disabled>Choose one</option>
                {CONCERNS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="b-email" className="label">Email <span className="font-normal text-muted">(optional)</span></label>
              <input id="b-email" name="email" type="email" autoComplete="email" className="field" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="b-notes" className="label">Anything the doctor should know? <span className="font-normal text-muted">(optional)</span></label>
              <textarea id="b-notes" name="notes" rows={2} className="field h-auto py-3" />
            </div>
            {error && <p role="alert" className="col-span-2 rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm text-[#a3361f]">{error}</p>}
            <p className="col-span-2 text-sm text-muted">Your details are shared only with our doctors and authorised staff.</p>
            <div className="col-span-2 flex gap-3">
              <button type="button" className="btn-outline" onClick={() => setStep(2)}>Back</button>
              <button type="submit" className="btn-primary flex-1" disabled={pending}>{pending ? "Booking…" : "Confirm booking"}</button>
            </div>
          </form>
        )}

        {step === 4 && done && (
          <div role="status" className="fade-in flex flex-col items-center gap-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <p className="font-display text-2xl">Booking #{done.number}</p>
            <div className="w-full rounded-2xl bg-cream p-4 text-left text-[15px] leading-7">
              <p>{done.type} with {done.doctor}</p>
              <p>{done.when}</p>
              {done.status === "PENDING_PAYMENT" ? (
                <p className="mt-2 text-sage-dark">
                  Consultation fee {done.fee ? inr(done.fee) : ""}. Our team will send you a payment link on WhatsApp to confirm your slot.
                </p>
              ) : (
                <p className="mt-2 text-sage-dark">We’ll send the confirmation and a reminder on WhatsApp before your slot.</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn-primary">Continue shopping</Link>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setStep(1);
                  setDone(null);
                  setMin(null);
                }}
              >
                Book another
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
