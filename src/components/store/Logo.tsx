import Image from "next/image";
import Link from "next/link";

/** NUPAL logo with the “Since 1960” line underneath. */
export function Logo({ light = false, className = "h-11 w-auto", since = true }: { light?: boolean; className?: string; since?: boolean }) {
  return (
    <Link href="/" aria-label="NUPAL Ayurveda, since 1960 — home" className="inline-flex shrink-0 flex-col items-center leading-none">
      <Image src={light ? "/brand/nupal-logo-light.svg" : "/brand/nupal-logo.svg"} alt="" width={151} height={65} priority className={className} />
      {since && (
        <span className={`mt-1 flex items-center gap-1.5 pl-[.32em] text-[9px] font-semibold tracking-[.32em] ${light ? "text-[#E8B48F]" : "text-[#A0522D]"}`}>
          <i aria-hidden="true" className={`block h-px w-3.5 ${light ? "bg-[#E8B48F]/60" : "bg-[#D7A98E]"}`} />
          SINCE 1960
          <i aria-hidden="true" className={`block h-px w-3.5 ${light ? "bg-[#E8B48F]/60" : "bg-[#D7A98E]"}`} />
        </span>
      )}
    </Link>
  );
}
