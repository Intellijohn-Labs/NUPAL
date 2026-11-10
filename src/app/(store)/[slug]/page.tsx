import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { PLATFORMS, SocialIcon } from "@/components/store/SocialIcon";
import { PageBlock } from "@/components/store/PageBlocks";
import { SectionSpy } from "@/components/store/ScrollFx";

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
      <header className={`relative overflow-hidden ${page.headerImage ? "bg-forest-deep text-white" : "bg-[#F7F4EE]"}`}>
        {page.headerImage ? (
          <>
            {/* Uploaded background photo, with a soft green shade so the title stays readable */}
            <img src={page.headerImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,74,44,.85),rgba(15,74,44,.45)_60%,rgba(15,74,44,.25))]" />
          </>
        ) : null}
        <div className={`container-x relative ${page.headerImage ? "pb-28 pt-14 sm:pb-36 sm:pt-20" : "py-12 sm:py-16"}`}>
          <nav aria-label="Breadcrumb" className={`hero-in mb-3 text-sm ${page.headerImage ? "text-white/85" : "text-muted"}`}>
            <Link href="/" className={page.headerImage ? "hover:text-white" : "hover:text-ink"}>Home</Link> / <span className={page.headerImage ? "text-white" : "text-ink"}>{page.title}</span>
          </nav>
          <h1 className={`hero-in text-[clamp(36px,4.8vw,62px)] leading-[1.05] ${page.headerImage ? "text-white" : "text-ink"}`} style={{ animationDelay: ".08s" }}>{page.title}</h1>
          {page.headerImage && page.seoDesc && (
            <p className={`hero-in mt-3 max-w-[540px] text-lg ${page.headerImage ? "text-white/90" : "text-ink"}`} style={{ animationDelay: ".16s" }}>{page.seoDesc}</p>
          )}
        </div>
      </header>
      {withNav ? (
        <div className="container-x grid items-start gap-10 py-14 sm:py-20 lg:grid-cols-[240px_1fr] lg:gap-14">
          <nav aria-label="On this page" className="top-[137px] hidden flex-col gap-1 lg:sticky lg:flex">
            <p className="mb-2 text-xs font-medium uppercase tracking-[.16em] text-muted">On this page</p>
            {sections.map((sc) => (
              <a key={sc.id} href={`#${sc.anchor}`} data-spy={sc.anchor}
                className="relative rounded-lg px-3.5 py-2 text-[15px] text-muted transition-colors before:absolute before:left-0 before:top-1/2 before:h-0 before:w-[3px] before:-translate-y-1/2 before:rounded before:bg-gold before:transition-all hover:bg-white hover:text-ink data-[on]:bg-sunny data-[on]:font-medium data-[on]:text-forest-deep data-[on]:before:h-3/5">
                {sc.title}
              </a>
            ))}
          </nav>
          {/* mobile: horizontal pill row */}
          <nav aria-label="On this page" data-pills className="no-scrollbar sticky top-[129px] z-20 -mx-4 flex overflow-x-auto border-b border-line bg-mint/95 px-4 py-2.5 backdrop-blur lg:hidden">
            {sections.map((sc) => (
              <a key={sc.id} href={`#${sc.anchor}`} data-spy={sc.anchor}
                className="mr-2 shrink-0 rounded-full border border-line bg-white px-4 py-2 text-[14px] text-muted transition-colors data-[on]:border-forest data-[on]:bg-forest data-[on]:text-white">
                {sc.title}
              </a>
            ))}
          </nav>
          <div className="flex min-w-0 flex-col gap-20 sm:gap-24">{content}</div>
          <SectionSpy ids={sections.map((sc) => sc.anchor)} />
        </div>
      ) : (
        <div className={`container-x flex flex-col gap-20 py-14 sm:gap-24 sm:py-20 ${page.blocks.length ? "" : "max-w-[760px]"}`}>{content}</div>
      )}
    </article>
  );
}
