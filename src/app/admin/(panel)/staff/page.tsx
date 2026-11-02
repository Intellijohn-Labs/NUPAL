import { requireArea, ROLE_AREAS, ROLE_LABELS } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { StaffRow } from "@/components/admin/StaffRow";
import { StaffCreateForm } from "@/components/admin/StaffCreateForm";
import { updateStaff } from "./actions";

export default async function StaffPage() {
  const me = await requireArea("staff");
  const [users, doctors] = await Promise.all([db.user.findMany({ orderBy: { createdAt: "asc" } }), db.doctor.findMany({ orderBy: { sortOrder: "asc" } })]);
  const roles = Object.entries(ROLE_LABELS);

  return (
    <>
      <PageHeader title="Staff & access" subtitle="Who can sign in to the admin panel, and what each person can see." />
      <section className="a-card mb-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead><tr><th className="a-th">Role</th><th className="a-th">Can access</th></tr></thead>
          <tbody>
            {roles.map(([r, l]) => (
              <tr key={r}><td className="a-td font-semibold">{l}</td><td className="a-td text-[#56685d]">{ROLE_AREAS[r as keyof typeof ROLE_AREAS].join(", ")}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-3">
          <h2 className="font-sans text-lg font-semibold">People with admin access</h2>
          {users.map((u) => (
            <StaffRow key={u.id} u={u} isMe={u.id === me.id} roles={roles} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} action={updateStaff.bind(null, u.id)} />
          ))}
        </div>
        <StaffCreateForm roles={roles} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
      </div>
    </>
  );
}
