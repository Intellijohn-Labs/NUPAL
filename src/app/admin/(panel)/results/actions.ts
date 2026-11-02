"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ResultStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { guessFromFilename, normalisePatientId } from "@/lib/patient";
import { deleteStoredFile } from "@/lib/storage";

const done = () => {
  revalidatePath("/admin/results");
  revalidatePath("/");
  revalidatePath("/results");
};

/** Saves freshly uploaded photo URLs into the inbox, guessing patient ID and before/after from file names. */
export async function registerUploads(items: { url: string; filename: string }[]) {
  await requireArea("results");
  const clean = items.filter((i) => /^https?:\/\/|^\/uploads\//.test(i.url)).slice(0, 500);
  await db.resultUpload.createMany({ data: clean.map((i) => ({ url: i.url, filename: i.filename.slice(0, 200), ...guessFromFilename(i.filename) })) });
  done();
}

export type ExistingResult = { id: string; status: string; beforeUrl: string | null; afterUrl: string | null; imageUrl: string | null };
export type CreateResult = { ok: true } | { ok: false; error: string; duplicates?: ExistingResult[] };

export async function createResult(input: {
  beforeId?: string;
  afterId?: string;
  singleId?: string;
  patientId: string;
  consent: boolean;
  publish: boolean;
  /** What to do if this patient already has a result: ask (default), keep both, or replace the old one(s). */
  onDuplicate?: "ask" | "keep" | "replace";
}): Promise<CreateResult> {
  await requireArea("results");
  const patientId = normalisePatientId(input.patientId);
  if (!patientId) return { ok: false, error: "Enter the patient ID." };
  if (input.publish && !input.consent) return { ok: false, error: "Tick “Customer gave permission” before publishing." };
  const existing = await db.result.findMany({ where: { patientId }, select: { id: true, status: true, beforeUrl: true, afterUrl: true, imageUrl: true } });
  if (existing.length && (input.onDuplicate ?? "ask") === "ask")
    return { ok: false, error: `Patient ${patientId} already has ${existing.length === 1 ? "a result" : `${existing.length} results`}.`, duplicates: existing };
  const ids = [input.beforeId, input.afterId, input.singleId].filter(Boolean) as string[];
  const ups = await db.resultUpload.findMany({ where: { id: { in: ids } } });
  const url = (id?: string) => ups.find((u) => u.id === id)?.url ?? null;
  if (input.singleId ? !url(input.singleId) : !url(input.beforeId) || !url(input.afterId)) return { ok: false, error: "Photos not found — refresh the page." };
  await db.$transaction([
    db.result.create({
      data: {
        patientId,
        beforeUrl: input.singleId ? null : url(input.beforeId),
        afterUrl: input.singleId ? null : url(input.afterId),
        imageUrl: input.singleId ? url(input.singleId) : null,
        consent: input.consent,
        status: input.publish ? "PUBLISHED" : "DRAFT",
      },
    }),
    db.resultUpload.deleteMany({ where: { id: { in: ids } } }),
    ...(input.onDuplicate === "replace" && existing.length ? [db.result.deleteMany({ where: { id: { in: existing.map((e) => e.id) } } })] : []),
  ]);
  if (input.onDuplicate === "replace")
    await Promise.all(existing.flatMap((e) => [e.beforeUrl, e.afterUrl, e.imageUrl]).filter(Boolean).map((u) => deleteStoredFile(u!)));
  done();
  return { ok: true };
}

/** Pairs inbox photos that share a patient ID and are named “before” / “after”. */
export async function autoPair(consent: boolean): Promise<{ made: number; skipped: string[] }> {
  await requireArea("results");
  const ups = await db.resultUpload.findMany({ where: { patientId: { not: "" }, role: { in: ["before", "after"] } }, orderBy: { createdAt: "asc" } });
  const byPatient = new Map<string, typeof ups>();
  for (const u of ups) byPatient.set(u.patientId, [...(byPatient.get(u.patientId) ?? []), u]);
  const taken = new Set((await db.result.findMany({ where: { patientId: { in: [...byPatient.keys()] } }, select: { patientId: true } })).map((r) => r.patientId));
  let made = 0;
  const skipped: string[] = [];
  for (const [patientId, list] of byPatient) {
    if (taken.has(patientId)) {
      skipped.push(patientId);
      continue;
    }
    const before = list.find((u) => u.role === "before");
    const after = list.find((u) => u.role === "after");
    if (!before || !after) continue;
    await db.$transaction([
      db.result.create({ data: { patientId, beforeUrl: before.url, afterUrl: after.url, consent, status: "DRAFT" } }),
      db.resultUpload.deleteMany({ where: { id: { in: [before.id, after.id] } } }),
    ]);
    made++;
  }
  done();
  return { made, skipped };
}

export async function updateInboxItem(id: string, patch: { patientId?: string; role?: string }) {
  await requireArea("results");
  await db.resultUpload.update({
    where: { id },
    data: { ...(patch.patientId != null ? { patientId: normalisePatientId(patch.patientId) } : {}), ...(patch.role != null ? { role: patch.role } : {}) },
  });
  revalidatePath("/admin/results");
}

export async function deleteUploads(ids: string[]) {
  await requireArea("results");
  const ups = await db.resultUpload.findMany({ where: { id: { in: ids } } });
  await db.resultUpload.deleteMany({ where: { id: { in: ids } } });
  await Promise.all(ups.map((u) => deleteStoredFile(u.url)));
  revalidatePath("/admin/results");
}

export async function setResultStatus(id: string, status: ResultStatus) {
  await requireArea("results");
  const r = await db.result.findUnique({ where: { id } });
  if (!r) return;
  if (status === "PUBLISHED" && !r.consent) return;
  await db.result.update({ where: { id }, data: { status, ...(status !== "PUBLISHED" ? { featured: false } : {}) } });
  done();
}

export async function updateResult(id: string, f: FormData) {
  await requireArea("results");
  const consent = f.get("consent") === "on";
  const r = await db.result.findUnique({ where: { id } });
  if (!r) return;
  const newId = normalisePatientId(String(f.get("patientId") ?? r.patientId)) || r.patientId;
  if (newId !== r.patientId && (await db.result.count({ where: { patientId: newId } }))) {
    redirect(`/admin/results?tab=${r.status}&dup=${encodeURIComponent(newId)}`);
  }
  await db.result.update({
    where: { id },
    data: {
      patientId: newId,
      sortOrder: parseInt(String(f.get("sortOrder") ?? "0"), 10) || 0,
      consent,
      ...(!consent ? { status: r.status === "PUBLISHED" ? "HIDDEN" : r.status, featured: false } : {}),
    },
  });
  done();
}

export async function toggleResultFeatured(id: string, featured: boolean) {
  await requireArea("results");
  const r = await db.result.findUnique({ where: { id } });
  if (!r || (featured && r.status !== "PUBLISHED")) return;
  if (featured && (await db.result.count({ where: { featured: true } })) >= 4) return;
  await db.result.update({ where: { id }, data: { featured } });
  done();
}

export async function swapResult(id: string) {
  await requireArea("results");
  const r = await db.result.findUnique({ where: { id } });
  if (!r || !r.beforeUrl || !r.afterUrl) return;
  await db.result.update({ where: { id }, data: { beforeUrl: r.afterUrl, afterUrl: r.beforeUrl } });
  done();
}

export async function deleteResult(id: string) {
  await requireArea("results");
  const r = await db.result.delete({ where: { id } });
  await Promise.all([r.beforeUrl, r.afterUrl, r.imageUrl].filter(Boolean).map((u) => deleteStoredFile(u!)));
  done();
}
