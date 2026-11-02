import Image from "next/image";

export function DoctorPhoto({ src, name, size = 96 }: { src: string | null; name: string; size?: number }) {
  if (src)
    return (
      <Image src={src} alt={name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
    );
  const initials = name.replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[#dcd3c1] font-display text-forest"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-label={`${name} (photo coming soon)`}
      role="img"
    >
      {initials}
    </span>
  );
}
