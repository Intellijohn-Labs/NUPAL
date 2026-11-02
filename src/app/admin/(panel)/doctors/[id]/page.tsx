import { notFound } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateLabel, todayIST } from "@/lib/time";
import { minToHHMM } from "@/lib/format";
import { Flash, PageHeader } from "@/components/admin/PageHeader";
import { ImageField } from "@/components/admin/ImageField";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { SubmitButton } from "@/components/admin/ui";
import { addLeave, removeLeave, saveAvailability, saveDoctor } from "../actions";

export default async function DoctorEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireArea("doctors");
  const { id } = await params;
  const { saved } = await searchParams;
  const d =
    id === "new"
      ? null
      : await db.doctor.findUnique({
          where: { id },
          include: { availability: { orderBy: [{ weekday: "asc" }, { startMin: "asc" }] }, leaves: { where: { date: { gte: todayIST() } }, orderBy: { date: "asc" } } },
        });
  if (id !== "new" && !d) notFound();

  return (
    <>
      <PageHeader title={d?.name ?? "Add doctor"} />
      <Flash show={saved === "profile"}>Profile saved.</Flash>
      <Flash show={saved === "hours"}>Weekly hours saved. Open slots on the website are updated.</Flash>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="a-card">
          <h2 className="mb-4 font-sans text-lg font-semibold">Profile</h2>
          <form action={saveDoctor.bind(null, d?.id ?? null)} className="flex flex-col gap-4">
            <div><label htmlFor="name" className="a-label">Name</label><input id="name" name="name" required defaultValue={d?.name} placeholder="Dr …" className="a-input" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="q" className="a-label">Qualifications</label><input id="q" name="qualifications" defaultValue={d?.qualifications ?? "BAMS"} className="a-input" /></div>
              <div><label htmlFor="e" className="a-label">Experience</label><input id="e" name="experience" defaultValue={d?.experience} placeholder="e.g. 15 years" className="a-input" /></div>
            </div>
            <div><label htmlFor="sp" className="a-label">Specialities</label><input id="sp" name="specialities" defaultValue={d?.specialities.join(", ")} placeholder="Liver care, Women’s health" className="a-input" /><p className="a-help">Separate with commas.</p></div>
            <div><label htmlFor="la" className="a-label">Languages</label><input id="la" name="languages" defaultValue={d?.languages.join(", ")} placeholder="Malayalam, English" className="a-input" /></div>
            <div><label htmlFor="bio" className="a-label">Short introduction</label><textarea id="bio" name="bio" rows={4} defaultValue={d?.bio} className="a-textarea" /></div>
            <div><p className="a-label">Photo</p><ImageField name="photo" folder="doctors" multiple={false} existing={d?.photo ? [d.photo] : []} help="Square portrait, at least 600 × 600 px" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="so" className="a-label">Order on website</label><input id="so" name="sortOrder" inputMode="numeric" defaultValue={d?.sortOrder ?? 0} className="a-input" /></div>
              <label className="flex items-end gap-2 pb-3 text-[15px]"><input type="checkbox" name="active" defaultChecked={d?.active ?? true} className="h-5 w-5 accent-[#2e6b47]" />Taking bookings</label>
            </div>
            <SubmitButton>{d ? "Save profile" : "Add doctor"}</SubmitButton>
          </form>
        </section>

        {d && (
          <div className="flex flex-col gap-5">
            <section className="a-card">
              <h2 className="mb-1 font-sans text-lg font-semibold">Weekly consultation hours</h2>
              <p className="mb-4 text-sm text-[#56685d]">Slots are made from these hours using each consultation’s length. Add two ranges for a lunch break.</p>
              <form action={saveAvailability.bind(null, d.id)}>
                <HoursEditor initial={d.availability.map((a) => ({ day: a.weekday, start: minToHHMM(a.startMin), end: minToHHMM(a.endMin) }))} />
                <div className="mt-4"><SubmitButton>Save hours</SubmitButton></div>
              </form>
            </section>
            <section className="a-card">
              <h2 className="mb-1 font-sans text-lg font-semibold">Leave days</h2>
              <p className="mb-4 text-sm text-[#56685d]">No slots are shown to customers on these days.</p>
              <form action={addLeave.bind(null, d.id)} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <div><label htmlFor="from" className="a-label">From</label><input id="from" name="from" type="date" required min={todayIST()} className="a-input" /></div>
                <div><label htmlFor="to" className="a-label">To (optional)</label><input id="to" name="to" type="date" min={todayIST()} className="a-input" /></div>
                <div><label htmlFor="note" className="a-label">Note</label><input id="note" name="note" placeholder="e.g. Onam" className="a-input" /></div>
                <SubmitButton>Add leave</SubmitButton>
              </form>
              <ul className="mt-4 flex flex-col gap-2">
                {d.leaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-lg bg-[#fbe6e0] px-3 py-2 text-sm">
                    <span><span className="font-semibold">{dateLabel(l.date)}</span>{l.note ? ` · ${l.note}` : ""}</span>
                    <form action={removeLeave.bind(null, l.id, d.id)}><button className="font-semibold text-[#a3361f]">Remove</button></form>
                  </li>
                ))}
                {!d.leaves.length && <li className="text-sm text-[#56685d]">No upcoming leave.</li>}
              </ul>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
