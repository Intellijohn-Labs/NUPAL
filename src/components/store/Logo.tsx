import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false, className = "h-11 w-auto" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="NUPAL Remedies home" className="inline-flex shrink-0">
      <Image
        src={light ? "/brand/nupal-logo-light.svg" : "/brand/nupal-logo.svg"}
        alt="NUPAL Ayurveda"
        width={151}
        height={65}
        priority
        className={className}
      />
    </Link>
  );
}
