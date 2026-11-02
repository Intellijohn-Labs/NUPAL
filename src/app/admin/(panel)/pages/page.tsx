import Link from "next/link";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Pill } from "@/components/admin/PageHeader";

export default async function PagesList() {
  await requireArea("pages");
  const pages = await db.page.findMany({ orderBy: { title: "asc" } });
  return (
    <>
      <PageHeader title="Pages & policies" subtitle="About Us, policies, FAQs and any other page on the website.">
        <Link href="/admin/pages/new" className="a-btn">+ New page</Link>
      </PageHeader>
      <div className="a-card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead><tr><th className="a-th">Page</th><th className="a-th">Address</th><th className="a-th">Status</th><th className="a-th">Updated</th></tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="a-td font-semibold"><Link href={`/admin/pages/${p.id}`}>{p.title}</Link></td>
                <td className="a-td text-[#56685d]">/{p.slug}</td>
                <td className="a-td">{p.published ? <Pill tone="green">Published</Pill> : <Pill tone="grey">Draft</Pill>}</td>
                <td className="a-td text-[#56685d]">{p.updatedAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
