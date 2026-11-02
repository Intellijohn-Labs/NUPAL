export const BLOCK_TYPES = ["text", "message", "people", "logos", "gallery"] as const;

export const BLOCK_LABELS: Record<string, { name: string; help: string }> = {
  text: { name: "Text", help: "Paragraphs with an optional photo beside them" },
  message: { name: "Message", help: "A photo, a message and a name — e.g. Chairman’s Message" },
  people: { name: "People", help: "Photo cards with name and role — e.g. Management" },
  logos: { name: "Logos", help: "A grid of logos — e.g. Our Associates" },
  gallery: { name: "Gallery", help: "Photos that open full size — e.g. certificates, CSR" },
};

export type TextData = { body?: string; image?: string | null; imageSide?: "left" | "right" };
export type MessageData = { photo?: string | null; name?: string; role?: string; body?: string };
export type Person = { photo?: string | null; name: string; role: string; bio: string };
export type Logo = { image?: string | null; name: string; url: string };
export type PeopleData = { people?: Person[] };
export type LogosData = { logos?: Logo[] };
export type GalleryData = { images?: string[] };
