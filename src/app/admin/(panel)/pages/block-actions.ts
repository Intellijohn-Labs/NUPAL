"use server";

import { revalidatePath } from "next/cache";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { str } from "@/lib/form";
import { BLOCK_TYPES } from "@/lib/blocks";

const DEFAULT_TITLE: Record<string, string> = { hero: "", founder: "Our story is written in our DNA", duo: "Vision & mission", intro: "Since [year]", stats: "", timeline: "Our journey", cards: "What we stand for", text: "", message: "Chairman’s Message", people: "Management", logos: "Our Associates", gallery: "Gallery" };

async function refresh(pageId: string) {
  const page = await db.page.findUnique({ where: { id: pageId }, select: { slug: true } });
  revalidatePath(`/admin/pages/${pageId}`);
  if (page) revalidatePath(`/${page.slug}`);
}

async function uniqueAnchor(pageId: string, title: string, exceptId?: string) {
  const base = slugify(title) || "section";
  let anchor = base;
  for (let n = 2; await db.pageBlock.findFirst({ where: { pageId, anchor, NOT: exceptId ? { id: exceptId } : undefined } }); n++) anchor = `${base}-${n}`;
  return anchor;
}

export async function addBlock(pageId: string, type: string) {
  await requireArea("pages");
  if (!(BLOCK_TYPES as readonly string[]).includes(type)) return;
  const last = await db.pageBlock.findFirst({ where: { pageId }, orderBy: { sortOrder: "desc" } });
  const title = DEFAULT_TITLE[type] ?? "";
  await db.pageBlock.create({
    data: { pageId, type, title, anchor: title ? await uniqueAnchor(pageId, title) : "", sortOrder: (last?.sortOrder ?? 0) + 1, data: {} },
  });
  await refresh(pageId);
}

const keep = (f: FormData, name: string) => f.getAll(`${name}_keep`).map(String);

export async function saveBlock(id: string, f: FormData) {
  await requireArea("pages");
  const b = await db.pageBlock.findUnique({ where: { id } });
  if (!b) return;
  const title = str(f, "title");
  let data: Record<string, unknown> = {};

  const rows = (...names: string[]) => {
    const cols = names.map((n) => f.getAll(`row_${n}`).map(String));
    return cols[0].map((_, i) => Object.fromEntries(names.map((n, k) => [n, (cols[k][i] ?? "").trim()])));
  };
  if (b.type === "hero") {
    data = {
      eyebrow: str(f, "eyebrow"),
      headline: str(f, "headline"),
      text: str(f, "text"),
      cta1Label: str(f, "cta1Label"),
      cta1Href: str(f, "cta1Href"),
      cta2Label: str(f, "cta2Label"),
      cta2Href: str(f, "cta2Href"),
    };
  } else if (b.type === "intro") {
    data = { eyebrow: str(f, "eyebrow"), image: keep(f, "image")[0] ?? null, body: str(f, "body"), name: str(f, "name"), role: str(f, "role") };
  } else if (b.type === "founder") {
    data = { eyebrow: str(f, "eyebrow"), image: keep(f, "image")[0] ?? null, quote: str(f, "quote"), body: str(f, "body"), badge: str(f, "badge"), badgeSub: str(f, "badgeSub") };
  } else if (b.type === "duo") {
    data = { eyebrow: str(f, "eyebrow"), cards: rows("title", "text").filter((r) => r.title).slice(0, 2) };
  } else if (b.type === "stats") {
    data = {
      stats: rows("value", "suffix", "label")
        .map((r) => ({ value: Math.max(0, parseInt(r.value.replace(/[^\d]/g, ""), 10) || 0), suffix: r.suffix.slice(0, 4), label: r.label }))
        .filter((r) => r.label),
    };
  } else if (b.type === "timeline") {
    data = { items: rows("year", "title", "text").filter((r) => r.year || r.title) };
  } else if (b.type === "cards") {
    data = { intro: str(f, "intro"), cards: rows("title", "text").filter((r) => r.title) };
  } else if (b.type === "text") {
    data = { body: str(f, "body"), image: keep(f, "image")[0] ?? null, imageSide: str(f, "imageSide") === "left" ? "left" : "right" };
  } else if (b.type === "message") {
    data = { photo: keep(f, "photo")[0] ?? null, name: str(f, "name"), role: str(f, "role"), quote: str(f, "quote"), body: str(f, "body") };
  } else if (b.type === "people") {
    const keys = f.getAll("row_key").map(String);
    const names = f.getAll("row_name").map(String);
    const roles = f.getAll("row_role").map(String);
    const bios = f.getAll("row_bio").map(String);
    const quals = f.getAll("row_qual").map(String);
    const focuses = f.getAll("row_focus").map(String);
    data = {
      people: keys
        .map((k, i) => ({ name: names[i]?.trim() ?? "", role: roles[i]?.trim() ?? "", qual: quals[i]?.trim() ?? "", focus: focuses[i]?.trim() ?? "", bio: bios[i]?.trim() ?? "", photo: keep(f, `row_${k}_img`)[0] ?? null }))
        .filter((p) => p.name),
    };
  } else if (b.type === "logos") {
    const keys = f.getAll("row_key").map(String);
    const names = f.getAll("row_name").map(String);
    const urls = f.getAll("row_url").map(String);
    data = {
      logos: keys
        .map((k, i) => ({ name: names[i]?.trim() ?? "", url: urls[i]?.trim() ?? "", image: keep(f, `row_${k}_img`)[0] ?? null }))
        .filter((l) => l.name || l.image),
    };
  } else if (b.type === "gallery") {
    data = { images: keep(f, "images") };
  }

  await db.pageBlock.update({
    where: { id },
    data: { title, anchor: title ? await uniqueAnchor(b.pageId, title, id) : "", data: data as object },
  });
  await refresh(b.pageId);
}

export async function moveBlock(id: string, dir: -1 | 1) {
  await requireArea("pages");
  const b = await db.pageBlock.findUnique({ where: { id } });
  if (!b) return;
  const all = await db.pageBlock.findMany({ where: { pageId: b.pageId }, orderBy: { sortOrder: "asc" } });
  const i = all.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, k) => db.pageBlock.update({ where: { id: x.id }, data: { sortOrder: k + 1 } })));
  await refresh(b.pageId);
}

export async function deleteBlock(id: string) {
  await requireArea("pages");
  const b = await db.pageBlock.delete({ where: { id } });
  await refresh(b.pageId);
}
