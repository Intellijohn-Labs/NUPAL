import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ConcernCards } from "@/components/store/ConcernCards";

export const metadata: Metadata = {
  title: "All health concerns",
  description: "Find NUPAL Ayurvedic formulations, real results and expert advice for every health concern.",
};

export default async function ConcernsPage() {
  const concerns = await db.concern.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="pb-16">
      {concerns.length ? (
        <ConcernCards all concerns={concerns.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, tagline: c.tagline }))} />
      ) : (
        <p className="container-x py-16 text-center text-muted">Health concerns are coming soon.</p>
      )}
    </div>
  );
}
