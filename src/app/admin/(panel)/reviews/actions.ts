"use server";

import { revalidatePath } from "next/cache";
import type { ReviewStatus } from "@prisma/client";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { str } from "@/lib/form";
import { recomputeRating } from "@/lib/reviews";

async function done(productId: string) {
  await recomputeRating(productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  await requireArea("reviews");
  const r = await db.review.update({ where: { id }, data: { status, ...(status !== "APPROVED" ? { featured: false } : {}) } });
  await done(r.productId);
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireArea("reviews");
  const r = await db.review.update({ where: { id }, data: { featured, ...(featured ? { status: "APPROVED" } : {}) } });
  await done(r.productId);
}

export async function saveReply(id: string, f: FormData) {
  await requireArea("reviews");
  const r = await db.review.update({ where: { id }, data: { reply: str(f, "reply") || null } });
  await done(r.productId);
}

export async function deleteReview(id: string) {
  await requireArea("reviews");
  const r = await db.review.delete({ where: { id } });
  await done(r.productId);
}
