"use server";

import { revalidatePath } from "next/cache";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, collectImages, int, optStr, str } from "@/lib/form";
import { parseVideo } from "@/lib/video";

export async function saveTestimonial(id: string | null, _prev: string | null, f: FormData): Promise<string | null> {
  await requireArea("testimonials");
  const name = str(f, "name");
  const videoUrl = str(f, "videoUrl");
  if (!name) return "Enter the customer’s name.";
  if (!parseVideo(videoUrl)) return "Paste a YouTube link (video or Short), or a direct link to an .mp4 file.";
  const images = await collectImages(f, "thumb", "testimonials").catch((e: Error) => e);
  if (images instanceof Error) return images.message;
  const data = {
    name,
    place: str(f, "place"),
    quote: str(f, "quote"),
    videoUrl,
    thumbnail: images[0] ?? null,
    vertical: false, // all videos are shown wide (16:9)
    productId: optStr(f, "productId"),
    concernIds: f.getAll("concerns").map(String),
    active: bool(f, "active"),
    sortOrder: int(f, "sortOrder"),
  };
  if (id) await db.testimonial.update({ where: { id }, data });
  else await db.testimonial.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return "OK";
}

export async function deleteTestimonial(id: string) {
  await requireArea("testimonials");
  await db.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}
