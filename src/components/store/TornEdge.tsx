/**
 * Band edges. The team asked for straight edges everywhere (no waves),
 * so these render nothing and each coloured band meets the next in a straight line.
 * Kept as components so the sections that use them don't need changing.
 */
export function TornEdge(_props: { fill: string; at?: "top" | "bottom" }) {
  return null;
}

export function InnerEdge(_props: { fill: string; at: "top" | "bottom"; shadow?: boolean }) {
  return null;
}
