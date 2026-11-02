import Link from "next/link";
import type { Prisma, ReviewStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Pill } from "@/components/admin/PageHeader";
import { ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { Stars } from "@/components/store/Stars";
import { deleteReview, saveReply, setReviewStatus, toggleFeatured } from "./actions";

const TABS: [ReviewStatus, string][] = [["PENDING", "Waiting for approval"], ["APPROVED", "Approved"], ["HIDDEN", "Hidden"]];

const PER_PAGE = 50;

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requireArea("reviews");
  const sp = await searchParams;
  const status: ReviewStatus = sp.status && TABS.some(([k]) => k === sp.status) ? (sp.status as ReviewStatus) : "PENDING";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ReviewWhereInput = {
    status,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { product: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const [reviews, total, counts] = await Promise.all([
    db.review.findMany({ where, include: { product: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.review.count({ where }),
    db.review.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: ReviewStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (over: { status?: string; page?: number }) => {
    const p = new URLSearchParams();
    p.set("status", over.status ?? status);
    if (q && !over.status) p.set("q", q);
    if (over.page && over.page > 1) p.set("page", String(over.page));
    return `/admin/reviews?${p}`;
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="Customer reviews appear on the website only after you approve them. Featured reviews also show on the homepage." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1 rounded-xl bg-[#e3eae5] p-1">
        {TABS.map(([k, l]) => (
          <Link key={k} href={link({ status: k })} className={`rounded-lg px-3 py-2 text-sm font-semibold ${status === k ? "bg-white" : "text-[#56685d]"}`}>
            {l} ({count(k)})
          </Link>
        ))}
      </div>
      <form className="flex flex-1 gap-2">
        <input type="hidden" name="status" value={status} />
        <label htmlFor="rq" className="sr-only">Search reviews</label>
        <input id="rq" name="q" defaultValue={q} placeholder="Customer, product, phone or words" className="a-input max-w-sm" />
        <button className="a-btn-ghost">Search</button>
        {q && <Link href={link({ status })} className="a-btn-ghost">Clear</Link>}
      </form>
      </div>
      {q && <p className="mb-3 text-sm text-[#56685d]">{total} {total === 1 ? "result" : "results"} for “{q}”</p>}

      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <article key={r.id} className="a-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars value={r.rating} />
                  {r.featured && <Pill tone="blue">On homepage</Pill>}
                  {r.verified && <Pill tone="green">Verified buyer</Pill>}
                </div>
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 whitespace-pre-line leading-6">{r.body}</p>
                <p className="mt-2 text-sm text-[#56685d]">
                  {r.name}{r.place ? `, ${r.place}` : ""}{r.phone ? ` · ${r.phone}` : ""} · {r.createdAt.toLocaleDateString("en-IN")} ·{" "}
                  <Link href={`/product/${r.product.slug}#reviews`} target="_blank" className="font-medium text-[#2e6b47]">{r.product.name}</Link>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status !== "APPROVED" && <form action={setReviewStatus.bind(null, r.id, "APPROVED")}><button className="a-btn">Approve</button></form>}
                {r.status !== "HIDDEN" && <form action={setReviewStatus.bind(null, r.id, "HIDDEN")}><button className="a-btn-ghost">Hide</button></form>}
                {r.status === "APPROVED" && (
                  <form action={toggleFeatured.bind(null, r.id, !r.featured)}>
                    <button className="a-btn-ghost">{r.featured ? "Remove from homepage" : "Show on homepage"}</button>
                  </form>
                )}
                <form action={deleteReview.bind(null, r.id)}><ConfirmButton message="Delete this review permanently?">Delete</ConfirmButton></form>
              </div>
            </div>
            <form action={saveReply.bind(null, r.id)} className="mt-3 flex flex-col gap-2 border-t border-[#e8eeea] pt-3 sm:flex-row sm:items-start">
              <label htmlFor={`rp-${r.id}`} className="sr-only">Reply from NUPAL</label>
              <textarea id={`rp-${r.id}`} name="reply" rows={2} defaultValue={r.reply ?? ""} placeholder="Reply publicly (optional), e.g. thank them or answer a question" className="a-textarea flex-1" />
              <SubmitButton className="a-btn-ghost">Save reply</SubmitButton>
            </form>
          </article>
        ))}
        {!reviews.length && <p className="a-card text-center text-[#56685d]">{q ? "No reviews match your search." : status === "PENDING" ? "No reviews waiting. New reviews from customers appear here." : "Nothing here."}</p>}
      </div>
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-5 flex flex-wrap items-center justify-center gap-1">
          {page > 1 && <Link href={link({ page: page - 1 })} className="a-btn-ghost">← Previous</Link>}
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
            .map((n, i, arr) => (
              <span key={n} className="flex items-center gap-1">
                {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-[#56685d]">…</span>}
                <Link href={link({ page: n })} aria-current={n === page ? "page" : undefined} className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold ${n === page ? "bg-[#2e6b47] text-white" : "border border-[#dce5df] bg-white"}`}>
                  {n}
                </Link>
              </span>
            ))}
          {page < pages && <Link href={link({ page: page + 1 })} className="a-btn-ghost">Next →</Link>}
        </nav>
      )}
    </>
  );
}
