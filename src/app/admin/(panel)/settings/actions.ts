"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireArea } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, int, optInt, str } from "@/lib/form";

export async function saveSettings(f: FormData) {
  await requireArea("settings");
  const data = {
    offerMessages: str(f, "offerMessages").split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    whatsappNumber: str(f, "whatsappNumber").replace(/[^\d]/g, ""),
    phone: str(f, "phone"),
    email: str(f, "email"),
    address: str(f, "address"),
    customerCareHours: str(f, "customerCareHours"),
    legalName: str(f, "legalName"),
    gstin: str(f, "gstin").toUpperCase(),
    resultsCount: Math.max(0, int(f, "resultsCount", 10000)),
    resultsHook: str(f, "resultsHook"),
    shippingFee: int(f, "shippingFee"),
    freeShippingAbove: optInt(f, "freeShippingAbove"),
    codEnabled: bool(f, "codEnabled"),
    codCharge: int(f, "codCharge"),
    codMaxOrder: optInt(f, "codMaxOrder"),
  };
  await db.setting.upsert({ where: { id: "site" }, update: data, create: { id: "site", ...data } });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function saveConsultTypes(f: FormData) {
  await requireArea("settings");
  const ids = f.getAll("ct_id").map(String);
  for (const id of ids) {
    const fee = str(f, `fee_${id}`);
    await db.consultationType.update({
      where: { id },
      data: {
        name: str(f, `name_${id}`),
        description: str(f, `desc_${id}`),
        durationMin: Math.max(5, int(f, `dur_${id}`, 20)),
        fee: fee === "" ? null : Math.max(0, parseInt(fee, 10) || 0),
        active: bool(f, `active_${id}`),
      },
    });
  }
  revalidatePath("/consult");
  redirect("/admin/settings?saved=consult");
}

const PLATFORM_KEYS = ["facebook", "instagram", "youtube", "x", "linkedin", "whatsapp"];

export async function saveSocialLink(id: string | null, f: FormData) {
  await requireArea("settings");
  const platform = str(f, "platform");
  let url = str(f, "url");
  if (!PLATFORM_KEYS.includes(platform) || !url) redirect("/admin/settings?social=invalid#social");
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const inFooter = bool(f, "inFooter");
  const data = { platform, url, label: str(f, "label"), inFooter, active: bool(f, "active"), sortOrder: int(f, "sortOrder") };
  const saved = id ? await db.socialLink.update({ where: { id }, data }) : await db.socialLink.create({ data });
  // Only one main (footer) account per platform.
  if (inFooter) await db.socialLink.updateMany({ where: { platform, id: { not: saved.id } }, data: { inFooter: false } });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=social#social");
}

export async function deleteSocialLink(id: string) {
  await requireArea("settings");
  await db.socialLink.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=social#social");
}
