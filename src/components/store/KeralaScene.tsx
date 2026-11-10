/** Illustrated Kerala scene (sun, leaf trees, lotus pond, hills) in the style of the NKP clinic artwork. Decorative. */
export function KeralaScene() {
  return (
    <svg viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="ks-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFEFE3" />
          <stop offset="1" stopColor="#EAF8F2" />
        </linearGradient>
        <radialGradient id="ks-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE680" />
          <stop offset="1" stopColor="#FFE680" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="360" fill="url(#ks-sky)" />
      <g className="ks-sun">
        <circle cx="1230" cy="70" r="170" fill="url(#ks-glow)" />
        <circle cx="1230" cy="70" r="118" fill="#FCE07A" opacity=".55" />
        <circle cx="1230" cy="70" r="88" fill="#F7CB20" />
        <circle cx="1230" cy="70" r="88" fill="none" stroke="#FFF2B0" strokeWidth="10" strokeDasharray="2 22" opacity=".8" />
      </g>
      <path d="M0 250 C 200 180 380 210 560 240 S 920 190 1100 225 1340 205 1440 220 V360 H0z" fill="#A1D033" />
      <path d="M0 290 C 240 240 460 270 700 280 S 1100 250 1440 275 V360 H0z" fill="#79C222" />
      <path d="M0 330 C 300 300 640 320 900 325 S 1280 305 1440 320 V360 H0z" fill="#428B46" />
      <g className="ks-sway" style={{ transformOrigin: "1060px 340px" }}>
        <rect x="1052" y="190" width="14" height="150" rx="6" fill="#41693B" />
        <path d="M1059 40 C 1150 70 1170 170 1059 230 C 950 170 968 70 1059 40z" fill="#1A6A40" />
        <path d="M1059 50 V225 M1059 95 L1110 80 M1059 125 L1120 108 M1059 155 L1115 140 M1059 95 L1008 80 M1059 125 L998 108 M1059 155 L1003 140" stroke="#79C222" strokeWidth="3" fill="none" opacity=".7" />
      </g>
      <g className="ks-sway2" style={{ transformOrigin: "1350px 340px" }}>
        <rect x="1344" y="230" width="10" height="110" rx="5" fill="#856754" />
        <ellipse cx="1349" cy="205" rx="70" ry="62" fill="#E8692C" />
        <path d="M1349 150 V260 M1349 190 L1385 170 M1349 215 L1310 195 M1349 235 L1390 220" stroke="#F7CB20" strokeWidth="3" fill="none" opacity=".75" />
      </g>
      <g className="ks-sway2" style={{ transformOrigin: "820px 340px" }}>
        <rect x="814" y="220" width="12" height="140" rx="5" fill="#41693B" />
        <path d="M820 80 C 910 120 905 230 820 265 C 735 230 730 120 820 80z" fill="#0E938E" />
        <path d="M820 92 V260 M820 135 L865 120 M820 170 L870 155 M820 205 L862 192 M820 135 L776 120 M820 170 L770 155 M820 205 L778 192" stroke="#44CAAA" strokeWidth="3" fill="none" opacity=".8" />
      </g>
      <g className="ks-sway" style={{ transformOrigin: "890px 340px" }}>
        <rect x="885" y="250" width="9" height="90" rx="4" fill="#856754" />
        <circle cx="890" cy="225" r="46" fill="#B48BD6" />
        <path d="M890 185 V265 M890 215 L918 200 M890 235 L862 220" stroke="#E9D9F7" strokeWidth="3" fill="none" />
      </g>
      <g className="ks-birds" fill="none" stroke="#20424F" strokeWidth="3" strokeLinecap="round">
        <path d="M940 80 q12 -10 24 0 q12 -10 24 0" />
        <path d="M1000 110 q9 -8 18 0 q9 -8 18 0" />
      </g>
      <g transform="translate(260 0)">
        <ellipse cx="560" cy="345" rx="190" ry="26" fill="#44CAAA" opacity=".85" />
        <ellipse cx="500" cy="340" rx="34" ry="8" fill="#79C222" />
        <ellipse cx="620" cy="347" rx="28" ry="7" fill="#79C222" />
        <g transform="translate(560 318)">
          <path d="M0 18 C -18 6 -16 -10 0 -18 C 16 -10 18 6 0 18z" fill="#F4A6B0" />
          <path d="M0 18 C -26 14 -30 -2 -14 -8 C -8 4 -4 12 0 18z" fill="#F7C1C7" />
          <path d="M0 18 C 26 14 30 -2 14 -8 C 8 4 4 12 0 18z" fill="#F7C1C7" />
        </g>
      </g>
      <path d="M720 360 C 730 300 760 270 800 260 M745 320 L770 300 M735 340 L760 325 M752 300 L780 285" stroke="#1A6A40" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
