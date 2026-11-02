// Drawn stand-in shown until real product photos are uploaded in the admin panel.
const SHAPES: Record<string, "bottle" | "tube" | "jar"> = {
  "Cream & Ointment": "tube",
  Shampoo: "tube",
  "Hygiene Wash": "tube",
  "Rasayanam & Lepam": "jar",
  Granules: "jar",
  Churna: "jar",
};
const PALETTE = [
  ["#1F3D2B", "#2C5A3D"],
  ["#3B2A12", "#7A4E1E"],
  ["#4A1F14", "#913810"],
  ["#1E4A30", "#4F8A5B"],
  ["#1F3A5A", "#3F6E8E"],
  ["#5A2A3A", "#8E4A5E"],
];

export function ProductArt({ name, type, size = 120 }: { name: string; type: string; size?: number }) {
  const shape = SHAPES[type] ?? "bottle";
  const hash = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const [cap, body] = PALETTE[hash % PALETTE.length];
  const label = name.split(" ")[0].slice(0, 12);
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 120 156" role="img" aria-label={`${name} (photo coming soon)`}>
      <ellipse cx="60" cy="150" rx="40" ry="5" fill="#000" opacity=".1" />
      {shape === "bottle" && (
        <>
          <rect x="38" y="6" width="44" height="24" rx="5" fill={cap} />
          <rect x="24" y="28" width="72" height="118" rx="15" fill={body} />
          <rect x="31" y="35" width="6" height="100" rx="3" fill="#fff" opacity=".15" />
          <rect x="30" y="62" width="60" height="50" rx="4" fill="#F3EEE2" />
        </>
      )}
      {shape === "tube" && (
        <>
          <rect x="32" y="8" width="56" height="9" rx="2" fill={cap} />
          <path d="M34 15h52l-8 104H42z" fill={body} />
          <rect x="40" y="118" width="40" height="30" rx="6" fill={cap} />
          <rect x="40" y="46" width="40" height="40" rx="3" fill="#F3EEE2" />
        </>
      )}
      {shape === "jar" && (
        <>
          <rect x="24" y="40" width="72" height="22" rx="5" fill={cap} />
          <rect x="18" y="60" width="84" height="86" rx="12" fill={body} />
          <rect x="18" y="78" width="84" height="46" fill="#F3EEE2" />
        </>
      )}
      <text
        x="60"
        y={shape === "jar" ? 105 : shape === "tube" ? 70 : 90}
        textAnchor="middle"
        fontFamily="var(--font-marcellus), Georgia, serif"
        fontSize={label.length > 9 ? 8 : 10}
        fill="#1C2A21"
      >
        {label}
      </text>
    </svg>
  );
}
