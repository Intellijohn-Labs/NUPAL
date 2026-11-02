export type ParsedVideo = { kind: "youtube"; id: string } | { kind: "file"; url: string } | null;

/** Accepts YouTube watch, youtu.be, Shorts and embed links, or a direct .mp4/.webm link. */
export function parseVideo(url: string): ParsedVideo {
  const u = url.trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { kind: "youtube", id: yt[1] };
  if (/^https?:\/\/.+\.(mp4|webm|mov)(\?.*)?$/i.test(u)) return { kind: "file", url: u };
  return null;
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
