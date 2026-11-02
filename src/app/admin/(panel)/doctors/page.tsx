import Link from "next/link";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { minToLabel } from "@/lib/format";
import { PageHeader, Pill } from "@/components/admin/PageHeader";
import { DoctorPhoto } from "@/components/store/DoctorPhoto";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function DoctorsPage() {
  await requireArea("doctors");
  const doctors = await db.doctor.findMany({ orderBy: { sortOrder: "asc" }, include: { availability: true } });
  return (
    <>
      <PageHeader title="Doctors & timings" subtitle="Doctor profiles, weekly consultation hours and leave days.">
        <Link href="/admin/doctors/new" className="a-btn">+ Add doctor</Link>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((d) => {
          const days = [...new Set(d.availability.map((a) => a.weekday))].sort();
          const first = d.availability[0];
          return (
            <Link key={d.id} href={`/admin/doctors/${d.id}`} className="a-card flex items-center gap-4 hover:border-[#2e6b47]">
              <DoctorPhoto src={d.photo} name={d.name} size={64} />
              <div className="flex-1">
                <p className="text-lg font-semibold">{d.name}</p>
                <p className="text-sm text-[#56685d]">{d.qualifications}{d.experience ? ` · ${d.experience}` : ""}</p>
                <p className="mt-1 text-sm">
                  {days.length ? days.map((x) => WD[x]).join(", ") : "No hours set"}
                  {first ? ` · from ${minToLabel(first.startMin)}` : ""}
                </p>
              </div>
              {d.active ? <Pill tone="green">Taking bookings</Pill> : <Pill tone="grey">Hidden</Pill>}
            </Link>
          );
        })}
      </div>
    </>
  );
}
