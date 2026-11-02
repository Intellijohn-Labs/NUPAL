"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2, "Enter your name.").max(60),
  place: z.string().trim().max(60).optional(),
  phone: z.string().trim().regex(/^([6-9]\d{9})?$/, "Enter a valid 10-digit mobile number, or leave it empty.").optional(),
  rating: z.number().int().min(1, "Choose a star rating.").max(5),
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().min(15, "Please write at least a sentence about your experience.").max(1500),
  website: z.string().optional(), // honeypot — real people never fill this
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(input: z.input<typeof schema>): Promise<ReviewResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.website) return { ok: true }; // bot: pretend it worked
  const product = await db.product.findUnique({ where: { id: d.productId } });
  if (!product || !product.isActive) return { ok: false, error: "This product isn’t available." };

  // Same phone can review a product once a day.
  if (d.phone) {
    const recent = await db.review.findFirst({ where: { productId: d.productId, phone: d.phone, createdAt: { gte: new Date(Date.now() - 86_400_000) } } });
    if (recent) return { ok: false, error: "You’ve already reviewed this product today. Thank you!" };
  }
  // “Verified buyer” when this phone has a delivered order containing the product.
  const verified = d.phone
    ? !!(await db.order.findFirst({ where: { phone: d.phone, status: "DELIVERED", items: { some: { variant: { productId: d.productId } } } } }))
    : false;

  await db.review.create({
    data: { productId: d.productId, name: d.name, place: d.place ?? "", phone: d.phone || null, rating: d.rating, title: d.title ?? "", body: d.body, verified },
  });
  return { ok: true };
}
