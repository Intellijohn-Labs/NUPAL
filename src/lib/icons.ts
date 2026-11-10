// Built-in line icons (24×24, stroke) for health concerns. Admins pick one by key.
export const CONCERN_ICONS: Record<string, { label: string; d: string }> = {
  liver: { label: "Liver (leaf)", d: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" },
  digestion: { label: "Digestion", d: "M14 4c-3 0-5 2-5 4s2 3 4 3 4 1 4 3-2 4-5 4H7M9 8c-2 0-3 1-3 2" },
  heart: { label: "Heart", d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10zM7 12h3l1.5-2.5L14 15l1.5-3H18" },
  diabetes: { label: "Sugar / diabetes", d: "M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12zM12 12v6M9 15h6" },
  immunity: { label: "Immunity", d: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM12 8v8M8 12h8" },
  women: { label: "Women’s health (flower)", d: "M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 10c-1-3 0-6 2-6s3 3 0 6M14 12c3-1 6 0 6 2s-3 3-6 0M12 14c1 3 0 6-2 6s-3-3 0-6M10 12c-3 1-6 0-6-2s3-3 6 0" },
  hair: { label: "Hair", d: "M7 4c-2 3 2 5 0 8s2 5 0 8M11 4c-2 3 2 5 0 8s2 5 0 8M15 4c-2 3 2 5 0 8s2 5 0 8M19 4c-2 3 2 5 0 8s2 5 0 8" },
  respiratory: { label: "Lungs / cough", d: "M12 4v8M12 12c-1 0-2-1-3-1-2 0-4 3-4 6 0 2 1 3 3 3 2 0 4-2 4-5M12 12c1 0 2-1 3-1 2 0 4 3 4 6 0 2-1 3-3 3-2 0-4-2-4-5" },
  piles: { label: "Piles", d: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM8 12h8" },
  joint: { label: "Joints / pain", d: "M8 3v6l4 3 4-3V3M8 21v-6l4-3 4 3v6" },
  weight: { label: "Weight", d: "M4 20h16l-2-12H6zM9 8a3 3 0 0 1 6 0" },
  skin: { label: "Skin", d: "M12 21c-4 0-7-3-7-7 0-3 3-7 7-11 4 4 7 8 7 11 0 4-3 7-7 7z" },
  sleep: { label: "Sleep / stress", d: "M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z" },
  kids: { label: "Kids", d: "M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 22v-6l-2-4 4-2h8l4 2-2 4v6" },
  leaf: { label: "Leaf (general)", d: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8" },
};
export const iconPath = (key: string) => (CONCERN_ICONS[key] ?? CONCERN_ICONS.leaf).d;
