import Link from "next/link";
import { iconPath } from "@/lib/icons";

export function ConcernRow({ concerns }: { concerns: { name: string; slug: string; icon: string }[] }) {
  return (
    <nav aria-label="Shop by health concern" className="border-b border-line bg-white">
      <div className="container-x no-scrollbar flex gap-1 overflow-x-auto py-4">
        {concerns.map((c) => (
          <Link key={c.slug} href={`/concern/${c.slug}`} className="group flex min-w-[96px] flex-1 flex-col items-center gap-2 rounded-xl px-2 py-1 text-center text-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1eee7] transition-colors group-hover:bg-mist">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3E5A42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={iconPath(c.icon)} />
              </svg>
            </span>
            <span className="leading-tight">{c.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
