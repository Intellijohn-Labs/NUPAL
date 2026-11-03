import type { Metadata } from "next";
import { db } from "@/lib/db";
import { DoctorPhoto } from "@/components/store/DoctorPhoto";
import { BookingWidget } from "@/components/store/BookingWidget";

export const metadata: Metadata = {
  title: "Consult an Ayurvedic doctor",
  description: "Book a video, phone or in-clinic consultation with NUPAL’s Ayurvedic doctors in under a minute.",
};

const FAQ = [
  ["Do I need to create an account?", "No. Your name and WhatsApp number are enough to book."],
  ["How do I join a video consultation?", "We send the video link on WhatsApp before your slot. It opens on any phone — no app download needed."],
  ["Can I reschedule or cancel?", "Yes. Reply to your WhatsApp confirmation and our team will move or cancel your slot."],
  ["Is my health information private?", "Yes. Your details are visible only to our doctors and authorised NUPAL staff."],
];

export default async function ConsultPage({ searchParams }: { searchParams: Promise<{ concern?: string }> }) {
  const concern = ((await searchParams).concern ?? "").slice(0, 60);
  const [doctors, types] = await Promise.all([
    db.doctor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.consultationType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="bg-cream">
      <div className="container-x grid items-start gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_520px]">
        <div className="flex flex-col gap-6">
          <h1 className="text-[clamp(34px,4.2vw,54px)] leading-[1.1]">Consult an Ayurvedic doctor</h1>
          <p className="max-w-[54ch] text-lg leading-8 text-muted">
            Get personal advice for your health concern and the right medicines for you — by video, phone or at our clinic. Booking takes under a
            minute and needs no account.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {doctors.map((d) => (
              <div key={d.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
                <DoctorPhoto src={d.photo} name={d.name} size={72} />
                <div>
                  <p className="font-display text-xl">{d.name}</p>
                  <p className="text-sm text-muted">{d.qualifications}{d.experience ? ` · ${d.experience}` : ""}</p>
                  {d.specialities.length > 0 && <p className="mt-1 text-sm text-sage-dark">{d.specialities.join(", ")}</p>}
                </div>
              </div>
            ))}
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {["Choose a doctor and how to meet", "Pick a date and open time", "Share your name, WhatsApp number and concern", "Get confirmation on WhatsApp"].map((s, i) => (
              <li key={s} className="flex items-start gap-3 rounded-xl bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-[#1b1608]">{i + 1}</span>
                <span className="text-[15px]">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <BookingWidget
          doctors={doctors.map((d) => ({ id: d.id, name: d.name }))}
          types={types.map((t) => ({ id: t.id, key: t.key, name: t.name, description: t.description, durationMin: t.durationMin, fee: t.fee }))}
          initialConcern={concern}
        />
      </div>
      <section className="container-x max-w-[820px] pb-16">
        <h2 className="mb-5 text-center text-3xl">Questions</h2>
        <div className="flex flex-col gap-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="rounded-xl bg-white px-5 py-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 leading-7 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
