export function Stars({ value, size = 16, label = true }: { value: number; size?: number; label?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (fill: string) => (
    <span className="flex" style={{ gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
        </svg>
      ))}
    </span>
  );
  return (
    <span className="relative inline-flex" role={label ? "img" : undefined} aria-label={label ? `${value.toFixed(1)} out of 5 stars` : undefined}>
      {row("#E3DCCD")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("#C9A45C")}
      </span>
    </span>
  );
}
