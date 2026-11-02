export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-sans text-2xl font-semibold sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#56685d]">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Flash({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <p role="status" className="mb-5 rounded-lg border border-[#b9dcc4] bg-[#ddf0e3] px-4 py-3 text-sm font-medium text-[#1e5a36]">
      {children}
    </p>
  );
}

const PILL: Record<string, string> = {
  green: "bg-[#ddf0e3] text-[#1e5a36]",
  amber: "bg-[#f8edd2] text-[#7a5410]",
  red: "bg-[#fbe6e0] text-[#a3361f]",
  blue: "bg-[#e0eaf8] text-[#1f4a80]",
  grey: "bg-[#e6e9e7] text-[#3f4a44]",
};
export function Pill({ tone, children }: { tone: keyof typeof PILL; children: React.ReactNode }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${PILL[tone]}`}>{children}</span>;
}
