import Link from "next/link";
import { Reveal } from "./Reveal";

/** Last call to action before the footer: a straight band in forest green, above the darker footer. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-h" className="relative -mb-28 mt-0 bg-[#174D36] pb-16 pt-14 text-center text-cream sm:pb-20 sm:pt-16">
      <svg viewBox="0 0 200 160" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 w-20 opacity-75 sm:w-44 sm:opacity-90">
        <path d="M10 160C30 90 80 50 150 40c-20 60-70 100-140 120z" fill="#3E7348" />
        <path d="M10 160C60 120 100 90 150 40" stroke="#72BF44" strokeWidth="2" fill="none" />
        <path d="M0 160C10 110 40 80 80 70c-10 40-40 70-80 90z" fill="#567459" />
      </svg>
      <svg viewBox="0 0 200 160" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 w-20 opacity-75 sm:w-44 sm:opacity-90">
        <path d="M190 160C170 90 120 50 50 40c20 60 70 100 140 120z" fill="#3E7348" />
        <path d="M190 160C140 120 100 90 50 40" stroke="#72BF44" strokeWidth="2" fill="none" />
        <path d="M200 160C190 110 160 80 120 70c10 40 40 70 80 90z" fill="#567459" />
      </svg>
      <div className="container-x relative">
        <Reveal>
          <h2 id="cta-h" className="text-[clamp(26px,3.4vw,44px)] font-semibold leading-tight text-white">Discover Ayurveda, With Care You Can Trust.</h2>
          <p className="mx-auto mt-3 max-w-[560px] leading-7 text-[#c9d4c8]">Explore our formulations or connect with an Ayurvedic expert for personalised guidance.</p>
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row sm:gap-3">
            <Link href="/shop" className="btn bg-white text-forest hover:bg-cream">Shop All Products</Link>
            <Link href="/consult" className="btn border border-white/40 text-cream hover:bg-white/10">Consult an Expert</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
