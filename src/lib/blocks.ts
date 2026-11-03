export const BLOCK_TYPES = ["intro", "text", "stats", "timeline", "cards", "message", "people", "logos", "gallery"] as const;

export const BLOCK_LABELS: Record<string, { name: string; help: string }> = {
  intro: { name: "Story opening", help: "Big headline, wide photo and intro — e.g. “Since 1965”" },
  text: { name: "Text", help: "Paragraphs with an optional photo beside them" },
  stats: { name: "Numbers", help: "Figures that count up — e.g. 50+ years, 100+ medicines" },
  timeline: { name: "Milestones", help: "Year-by-year history" },
  cards: { name: "Numbered cards", help: "01–04 cards — e.g. our values or how we make medicines" },
  message: { name: "Message", help: "A photo, a message and a name — e.g. Chairman’s Message" },
  people: { name: "People", help: "Photo cards with name and role — e.g. Management" },
  logos: { name: "Logos", help: "A grid of logos — e.g. Our Associates" },
  gallery: { name: "Gallery", help: "Photos that open full size — e.g. certificates, CSR" },
};

export type IntroData = { eyebrow?: string; image?: string | null; body?: string; name?: string; role?: string };
export type TextData = { body?: string; image?: string | null; imageSide?: "left" | "right" };
export type Stat = { value: number; suffix: string; label: string };
export type StatsData = { stats?: Stat[] };
export type Milestone = { year: string; title: string; text: string };
export type TimelineData = { items?: Milestone[] };
export type Card = { title: string; text: string };
export type CardsData = { intro?: string; cards?: Card[] };
export type MessageData = { photo?: string | null; name?: string; role?: string; body?: string };
export type Person = { photo?: string | null; name: string; role: string; bio: string };
export type Logo = { image?: string | null; name: string; url: string };
export type PeopleData = { people?: Person[] };
export type LogosData = { logos?: Logo[] };
export type GalleryData = { images?: string[] };
