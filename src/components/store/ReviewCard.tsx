import Link from "next/link";
import { Stars } from "./Stars";

export type ReviewData = {
  id: string;
  name: string;
  place: string;
  rating: number;
  title: string;
  body: string;
  reply: string | null;
  verified: boolean;
  createdAt: Date;
  product?: { name: string; slug: string };
};

export function ReviewCard({ r, clamp = false }: { r: ReviewData; clamp?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars value={r.rating} />
        {r.title && <h3 className="font-sans text-base font-semibold">{r.title}</h3>}
      </div>
      <p className={`mt-2 whitespace-pre-line leading-7 text-[#3f4a44] ${clamp ? "line-clamp-5" : ""}`}>{r.body}</p>
      <p className="mt-3 text-sm text-muted">
        <span className="font-medium text-ink">{r.name}</span>
        {r.place ? `, ${r.place}` : ""} · {r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        {r.verified && <span className="ml-2 font-semibold text-[#2e7d4f]">✓ Verified buyer</span>}
      </p>
      {r.product && (
        <Link href={`/product/${r.product.slug}#reviews`} className="mt-1 text-sm font-medium text-sage hover:underline">
          {r.product.name}
        </Link>
      )}
      {r.reply && (
        <div className="mt-3 rounded-xl bg-mist p-3 text-[15px]">
          <p className="mb-1 text-sm font-semibold text-sage-dark">Reply from NUPAL</p>
          <p className={`whitespace-pre-line leading-7 ${clamp ? "line-clamp-3" : ""}`}>{r.reply}</p>
        </div>
      )}
    </article>
  );
}
