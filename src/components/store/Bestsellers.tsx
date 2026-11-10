import Link from "next/link";
import { ProductCard, type CardProduct } from "./ProductCard";
import { Reveal } from "./Reveal";
import { TornEdge } from "./TornEdge";

/** “Trusted Favourites, Chosen by You”: four products on a blush band. `joinBelow`: the next band continues straight on. */
export function Bestsellers({ products, joinBelow = false }: { products: CardProduct[]; joinBelow?: boolean }) {
  if (!products.length) return null;
  return (
    <section id="bestsellers" aria-labelledby="best-h" className={`relative mt-14 scroll-mt-28 bg-blush pt-12 sm:mt-20 sm:pt-14 ${joinBelow ? "pb-12 sm:pb-16" : "mb-14 pb-12 sm:mb-20 sm:pb-16"}`}>
      <TornEdge fill="#FDEDEA" at="top" />
      {!joinBelow && <TornEdge fill="#FDEDEA" at="bottom" />}
      <div className="container-x">
        <Reveal className="text-center">
          <h2 id="best-h" className="text-[clamp(28px,3.4vw,44px)] leading-tight">Trusted Favourites, Chosen by You</h2>
          <p className="mx-auto mt-2 max-w-[560px] text-muted">Explore some of our most popular Ayurvedic formulations.</p>
        </Reveal>
        <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {products.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} index={i} className="h-full">
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/shop" className="font-semibold text-brick underline-offset-4 hover:underline">View All Products →</Link>
        </div>
      </div>
    </section>
  );
}
