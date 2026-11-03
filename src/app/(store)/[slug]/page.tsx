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
      {page.content.trim() && (
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
          <ul className="grid gap-3 sm:grid-cols-2">
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
      {withNav && (
        <nav aria-label="On this page" className="sticky top-[129px] z-30 border-b border-line bg-white/95 backdrop-blur lg:top-[121px]">
          <ul className="container-x no-scrollbar flex gap-1 overflow-x-auto py-2">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a href={`#${s.anchor}`} className="block rounded-full px-4 py-2 text-[15px] text-muted transition-colors hover:bg-cream hover:text-ink">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className={`container-x flex flex-col gap-20 py-14 sm:gap-24 sm:py-20 ${page.blocks.length ? "" : "max-w-[760px]"}`}>{content}</div>
    </article>
  );
}
