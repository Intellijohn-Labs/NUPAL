import Image from "next/image";
import Link from "next/link";
import { DoctorPhoto } from "./DoctorPhoto";
import { Reveal } from "./Reveal";

export type ConsultDoctor = { id: string; name: string; qualifications: string; experience: string; photo: string | null };
export type ConsultType = { name: string; fee: number | null };

/**
 * Homepage section 05 (team PDF): “Need Help Choosing? We’re Here to Guide You.”
 * Light sage band. Left: NUPAL’s real doctors inside a warm “clinic” panel (shelves of jars and a window
 * drawn faintly behind them, echoing the PDF illustration). Right: copy, three feature rows,
 * Book a Consultation and a round WhatsApp button. Phones: doctors first, then text and buttons.
 */
export function ConsultBand({ doctors, types, waDigits }: { doctors: ConsultDoctor[]; types: ConsultType[]; waDigits: string }) {
  const docs = doctors.slice(0, 2);
  const fees = types.map((t) => t.fee).filter((f): f is number => typeof f === "number" && f > 0);
  const fromFee = fees.length ? Math.min(...fees) : null;
  const names = types.map((t, i) => (i ? t.name.toLowerCase() : t.name));
  const modes = names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}` : names[0] ?? "Video";

  const features: [string, React.ReactNode][] = [
    ["Guidance from qualified Ayurvedic physicians", <path key="a" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />],
    ["Convenient appointment booking", <path key="b" d="M4 7h16v13H4zM4 11h16M8 4v4M16 4v4M9 15.5l2 2 4-4" />],
    [`${modes} consultation, with medicine dispatch`, <path key="c" d="M3 7h12v10H3zM15 10l6-3v10l-6-3" />],
  ];

  return (
    <section aria-labelledby="consult" className="relative overflow-hidden bg-[#E9F2E5]">
      {/* leaf in the corner, as in the PDF */}
      <svg viewBox="0 0 120 120" aria-hidden="true" className="pointer-events-none absolute -bottom-6 -left-6 w-24 opacity-90 sm:w-32">
        <path d="M8 118C4 70 30 28 90 10c6 58-24 98-82 108z" fill="#3E8A47" />
        <path d="M10 116C40 80 62 52 88 14" stroke="#7CBF55" strokeWidth="2" fill="none" />
      </svg>

      <div className="container-x relative grid grid-cols-1 items-center gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-24 [&>*]:min-w-0">
        {/* Doctors in the clinic panel */}
        <Reveal from="left">
          <div className="relative mx-auto max-w-[540px] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#FBF4E6_0%,#F3E6CC_100%)] px-5 pb-6 pt-14 sm:px-8 sm:pt-16">
            {/* faint clinic backdrop: shelves of jars and a window */}
            <svg viewBox="0 0 540 300" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 w-full opacity-[.32]">
              {[0, 1].map((r) => (
                <g key={r} transform={`translate(24 ${46 + r * 86})`}>
                  {[0, 1, 2, 3, 4, 5].map((j) => (
                    <g key={j} transform={`translate(${j * 36} 0)`}>
                      <rect x="2" y="0" width="22" height="7" rx="2" fill="#6B4A2A" />
                      <rect x="0" y="6" width="26" height={j % 2 ? 44 : 38} rx="5" fill={j % 3 === 1 ? "#8A5A2E" : "#C08A4A"} transform={`translate(0 ${j % 2 ? 0 : 6})`} />
                    </g>
                  ))}
                  <rect x="-6" y="52" width="232" height="5" rx="2" fill="#8A6A44" />
                </g>
              ))}
              <g transform="translate(372 26)">
                <rect width="136" height="176" rx="6" fill="#FFFDF7" stroke="#D9C49E" strokeWidth="5" />
                <path d="M68 0v176M0 88h136" stroke="#D9C49E" strokeWidth="5" />
                <path d="M26 166c-4-30 6-52 26-64 4 30-6 52-26 64zM104 166c6-26 0-46-20-58-6 26 0 46 20 58z" fill="#7CBF55" />
              </g>
            </svg>

            <span className="absolute left-4 top-4 z-10 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-[#174D36] shadow-sm backdrop-blur sm:left-6 sm:top-5">
              <span className="sm:hidden">Our physicians</span>
              <span className="hidden sm:inline">Our Ayurvedic physicians</span>
            </span>

            <ul className={`relative grid gap-3 sm:gap-5 ${docs.length > 1 ? "grid-cols-2" : "mx-auto max-w-[260px] grid-cols-1"}`}>
              {docs.map((d, i) => (
                <li key={d.id} className={docs.length > 1 && i === 1 ? "sm:mt-8" : ""}>
                  <Link href="/consult" className="group block">
                    <span className={`relative block aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-2xl shadow-[0_24px_40px_-28px_rgba(23,77,54,.7)] ${i % 2 ? "bg-[#E3EDE0]" : "bg-[#F6EBD6]"}`}>
                      {d.photo ? (
                        <Image src={d.photo} alt={d.name} fill sizes="(max-width: 1024px) 45vw, 250px" className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <DoctorPhoto src={null} name={d.name} size={110} />
                        </span>
                      )}
                    </span>
                    <span className="relative -mt-6 mx-2 block rounded-2xl bg-white px-3 py-2.5 text-center shadow-[0_10px_24px_-18px_rgba(23,77,54,.6)] sm:mx-3 sm:py-3">
                      <span className="block font-display text-[15px] leading-tight text-[#174D36] sm:text-lg">{d.name}</span>
                      <span className="mt-0.5 block text-[11px] text-[#555E54] sm:text-xs">
                        {d.qualifications}
                        {d.experience ? ` · ${d.experience}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {fromFee && (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-[#174D36] px-3 py-1.5 text-xs font-medium text-white shadow-md sm:right-6 sm:top-5">
                Consultation from ₹{fromFee}
              </span>
            )}
          </div>
        </Reveal>

        {/* Copy and actions */}
        <Reveal from="right">
          <p className="text-xs font-medium uppercase tracking-[.14em] text-[#397C42]">Personalised Ayurvedic guidance</p>
          <h2 id="consult" className="mt-2 text-[clamp(30px,3.6vw,50px)] leading-[1.1] text-[#174D36]">
            Need Help Choosing?
            <br />
            We’re Here to Guide You.
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-7 text-[#555E54] sm:text-lg sm:leading-8">
            Speak with our qualified Ayurvedic doctors to discuss your health concerns and receive personalised guidance.
          </p>
          <ul className="mt-6 grid gap-2.5">
            {features.map(([text, icon]) => (
              <li key={text} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[15px] font-medium text-[#174D36] shadow-[0_1px_2px_rgba(23,77,54,.06)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#397C42" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                  {icon}
                </svg>
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex items-center gap-4">
            <Link href="/consult" className="inline-flex h-[52px] flex-1 items-center justify-center rounded-lg bg-[#174D36] px-8 text-base font-medium text-white transition-colors hover:bg-[#397C42] sm:h-14 sm:flex-none">
              Book a Consultation
            </Link>
            <a
              href={waDigits ? `https://wa.me/${waDigits}` : "/contact-us"}
              {...(waDigits ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex shrink-0 flex-col items-center gap-1 text-[11px] font-medium text-[#174D36]"
              aria-label="WhatsApp support"
            >
              <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#25A85A] text-white shadow-[0_10px_20px_-10px_rgba(37,168,90,.8)] transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" />
                </svg>
              </span>
              <span className="hidden sm:block">WhatsApp support</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
