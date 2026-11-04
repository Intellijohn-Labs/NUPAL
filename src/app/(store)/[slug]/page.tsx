import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { PLATFORMS, SocialIcon } from "@/components/store/SocialIcon";
import { PageBlock } from "@/components/store/PageBlocks";

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: (await params).slug } });
  return page ? { title: page.title, description: page.seoDesc ?? undefined } : { title: "Not found" };
}

export default async function CmsPage({ params }: { params: P }) {
  const page = await db.page.findUnique({ where: { slug: (await params).slug }, include: { blocks: { orderBy: { sortOrder: "asc" } } } });
  if (!page || !page.published) notFound();
  const socials = page.slug === "contact-us" ? await db.socialLink.findMany({ where: { active: true }, orderBy: [{ platform: "asc" }, { inFooter: "desc" }, { sortOrder: "asc" }] }) : [];
  const sections = page.blocks.filter((b) => b.title && b.anchor);
  const withNav = sections.length >= 2;

  const content = (
    <>
      {page.content.trim() && !page.blocks.length && (
        <div className="prose-nupal text-[17px]">
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </div>
      )}
      {page.blocks.map((b) => (
        <section key={b.id} id={b.anchor || undefined} className="scroll-mt-48" aria-label={b.title || undefined}>
          <PageBlock b={{ id: b.id, type: b.type, title: b.title, anchor: b.anchor, data: b.data }} />
        </section>
      ))}
      {socials.length > 0 && (
        <section aria-labelledby="follow">
          <h2 id="follow" className="mb-4 text-2xl">Follow us</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-line p-4 transition-colors hover:border-sage hover:bg-cream">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-sage-dark"><SocialIcon platform={s.platform} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{s.label || PLATFORMS[s.platform]}</span>
                    <span className="text-sm text-muted">{PLATFORMS[s.platform] ?? s.platform}</span>
                  </span>
                  <span aria-hidden="true" className="text-muted">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );

  return (
    <article>
      <header className="bg-cream">
        <div className="container-x py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="hero-in mb-3 text-sm text-muted">
            <Link href="/" className="hover:text-ink">Home</Link> / <span className="text-ink">{page.title}</span>
          </nav>
          <h1 className="hero-in text-[clamp(36px,4.8vw,62px)] leading-[1.05]" style={{ animationDelay: ".08s" }}>{page.title}</h1>
        </div>
      </header>
      {withNav ? (
        <div className="container-x grid grid-cols-1 items-start gap-10 py-14 sm:py-20 lg:grid-cols-[240px_1fr] lg:gap-14">
          <nav aria-label="On this page" className="top-[137px] hidden flex-col gap-1 lg:sticky lg:flex">
            <p className="mb-2 text-xs font-medium uppercase tracking-[.16em] text-muted">On this page</p>
            {sections.map((sc) => (
              <a key={sc.id} href={`#${sc.anchor}`}
                className="rounded-lg px-3 py-2 text-[15px] text-muted transition-colors hover:bg-cream hover:text-ink">
                {sc.title}
              </a>
            ))}
          </nav>
          {/* mobile: horizontal pill row */}
          <nav aria-label="On this page" className="no-scrollbar -mx-4 flex overflow-x-auto px-4 pb-6 lg:hidden">
            {sections.map((sc) => (
              <a key={sc.id} href={`#${sc.anchor}`}
                className="mr-2 shrink-0 rounded-full border border-line bg-cream px-4 py-2 text-[14px] text-muted">
                {sc.title}
              </a>
            ))}
          </nav>
          <div className="flex min-w-0 flex-col gap-20 sm:gap-24">{content}</div>
        </div>
      ) : (
        <div className={`container-x flex flex-col gap-20 py-14 sm:gap-24 sm:py-20 ${page.blocks.length ? "" : "max-w-[760px]"}`}>{content}</div>
      )}
    </article>
  );
}
