export function OfferBar({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  const row = messages.map((m, i) => (
    <span key={i} className="flex items-center gap-10">
      {m}
      <span aria-hidden="true" className="text-gold">
        ✦
      </span>
    </span>
  ));
  return (
    <div className="overflow-hidden bg-forest-deep py-2 text-[13px] text-[#e9e2d3]" aria-label="Current offers">
      <div className="marquee flex w-max gap-10 whitespace-nowrap pr-10">
        {row}
        <span aria-hidden="true" className="flex gap-10">
          {row}
        </span>
      </div>
    </div>
  );
}
