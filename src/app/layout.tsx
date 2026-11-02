import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted fonts (from @fontsource) so builds don’t depend on Google Fonts being reachable.
const jost = localFont({
  variable: "--font-jost",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/jost/files/jost-latin-300-normal.woff2", weight: "300" },
    { path: "../../node_modules/@fontsource/jost/files/jost-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/jost/files/jost-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/jost/files/jost-latin-600-normal.woff2", weight: "600" },
  ],
});
const marcellus = localFont({
  variable: "--font-marcellus",
  display: "swap",
  src: [{ path: "../../node_modules/@fontsource/marcellus/files/marcellus-latin-400-normal.woff2", weight: "400" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "NUPAL Remedies – Ayurvedic medicines from Kochi", template: "%s | NUPAL Remedies" },
  description:
    "Ayurvedic medicines from New Udaya Pharmacy & Ayurvedic Laboratories (NUPAL), Kochi. Shop by health concern or consult our Ayurvedic doctors online.",
  icons: { icon: "/brand/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${marcellus.variable}`}>
      <body>{children}</body>
    </html>
  );
}
