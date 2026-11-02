/**
 * Starter data taken from nupalremedies.com (Oct 2026). Everything here is editable in the admin panel.
 * Prices are the current site prices. MRP equals price until NUPAL shares MRPs; stock is a placeholder.
 * Run: npm run db:seed   (safe to re-run — it only adds what is missing)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const concerns = [
  ["Liver Health", "liver-health", "liver"],
  ["Digestion & Acidity", "digestion-acidity", "digestion"],
  ["Heart Health", "heart-health", "heart"],
  ["Diabetes Care", "diabetes-care", "diabetes"],
  ["Immunity", "immunity", "immunity"],
  ["Women’s Health", "womens-health", "women"],
  ["Hair Care", "hair-care", "hair"],
  ["Cough & Throat", "cough-throat", "respiratory"],
  ["Piles Care", "piles-care", "piles"],
  ["Joint & Pain", "joint-pain", "joint"],
  ["Weight Management", "weight-management", "weight"],
] as const;

type Seed = { name: string; type: string; brand?: string; shortDesc: string; concern: string; best?: boolean; packs: [string, number, number][] };

// [label, price, stock]
const products: Seed[] = [
  { name: "Kamilari Capsules", type: "Capsule", shortDesc: "Ayurvedic liver care, suitable for all age groups.", concern: "liver-health", best: true, packs: [["50 caps", 0, 0]] },
  { name: "Hridayamrith", type: "Capsule", shortDesc: "Heart health supplement.", concern: "heart-health", best: true, packs: [["1 pack", 285, 25]] },
  { name: "Hairomax Capsule", type: "Capsule", shortDesc: "Natural hair fortifying formula.", concern: "hair-care", best: true, packs: [["1 pack", 293, 25]] },
  { name: "Aciguardian", type: "Capsule", shortDesc: "For acidity and heartburn.", concern: "digestion-acidity", packs: [["1 pack", 208, 25]] },
  { name: "Diawin", type: "Capsule", shortDesc: "Ayurvedic support for diabetes care.", concern: "diabetes-care", packs: [["1 pack", 233, 25]] },
  { name: "Amenorm", type: "Capsule", shortDesc: "For menstrual health.", concern: "womens-health", packs: [["1 pack", 233, 25]] },
  { name: "Arshonil", type: "Rasayanam & Lepam", shortDesc: "Rasayanam for piles care.", concern: "piles-care", packs: [["1 pack", 388, 25]] },
  { name: "Arshonil Lepam", type: "Cream & Ointment", shortDesc: "External application for piles.", concern: "piles-care", packs: [["1 tube", 140, 25]] },
  { name: "Excof", type: "Syrup", shortDesc: "Ayurvedic syrup for cough.", concern: "cough-throat", packs: [["1 bottle", 562, 25]] },
  { name: "Detonsil", type: "Syrup", shortDesc: "For throat and tonsil care.", concern: "cough-throat", packs: [["1 bottle", 185, 25]] },
  { name: "Anodyne XL", type: "Cream & Ointment", shortDesc: "Cream for aches and pains.", concern: "joint-pain", packs: [["1 tube", 400, 0]] },
  { name: "Immuwin Junior", type: "Syrup", shortDesc: "Immunity syrup for children.", concern: "immunity", packs: [["1 bottle", 297, 25]] },
  { name: "Chyavanaprasam", type: "Rasayanam & Lepam", shortDesc: "Classical rasayana for strength and immunity.", concern: "immunity", packs: [["1 jar", 412, 0]] },
  { name: "Sumangaly", type: "Cream & Ointment", shortDesc: "[Add description in admin]", concern: "womens-health", packs: [["1 tube", 219, 25]] },
  { name: "Garcinia Cambogia", type: "Capsule", brand: "MONOEXTRACTS", shortDesc: "Capsules for weight management.", concern: "weight-management", packs: [["1 pack", 480, 0]] },
  { name: "Spirulina", type: "Capsule", brand: "MONOEXTRACTS", shortDesc: "Nutritional supplement.", concern: "immunity", packs: [["1 pack", 356, 0]] },
  { name: "Moringa", type: "Capsule", brand: "MONOEXTRACTS", shortDesc: "Nutritional supplement.", concern: "immunity", packs: [["1 pack", 356, 25]] },
];

const pages = [
  ["about-us", "About Us", "## New Udaya Pharmacy & Ayurvedic Laboratories\n\nNUPAL was shaped through many generations that have strived for excellence in unique, life-saving Ayurvedic medicines.\n\n[Edit this page in the admin panel under Pages & policies.]"],
  ["contact-us", "Contact Us", "**NUPAL Remedies**\n\nNupal Road, Kadavanthra P.O., Cochin – 682020\n\nPhone: 0484 2317881, 2315791\n\nCustomer care: 90617 70099 (9 AM – 5 PM)"],
  ["faqs", "FAQs", "## Do you offer cash on delivery?\n\nYes.\n\n## Can I talk to a doctor before buying?\n\nYes — book a consultation from the Consult a doctor page."],
  ["shipping-policy", "Shipping Policy", "[Add NUPAL’s shipping policy.]"],
  ["returns-refund-policy", "Returns & Refund Policy", "[Add NUPAL’s returns and refund policy.]"],
  ["privacy-policy", "Privacy Policy", "[Add NUPAL’s privacy policy, including how consultation details are handled.]"],
  ["terms-and-conditions", "Terms & Conditions", "[Add NUPAL’s terms and conditions.]"],
];

async function main() {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  await db.setting.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      offerMessages: ["Cash on delivery available", "Consult our Ayurvedic doctors — book in under a minute", "Classical Ayurvedic medicines from Kochi"],
      whatsappNumber: "",
      phone: "0484 2317881, 2315791",
      customerCareHours: "90617 70099 (9 AM – 5 PM)",
      email: "",
      legalName: "New Udaya Pharmacy & Ayurvedic Laboratories",
      address: "Nupal Road, Kadavanthra P.O., Cochin – 682020",
      shippingFee: 0,
      codEnabled: true,
    },
  });

  for (const [i, [name, s, icon]] of concerns.entries()) {
    await db.concern.upsert({ where: { slug: s }, update: {}, create: { name, slug: s, icon, sortOrder: i + 1 } });
  }

  for (const [i, p] of products.entries()) {
    const s = slug(p.name);
    if (await db.product.findUnique({ where: { slug: s } })) continue;
    const concern = await db.concern.findUnique({ where: { slug: p.concern } });
    await db.product.create({
      data: {
        name: p.name,
        slug: s,
        type: p.type,
        brand: p.brand,
        shortDesc: p.shortDesc,
        isBestseller: !!p.best,
        isActive: p.packs.every(([, price]) => price > 0), // Kamilari stays hidden until its price is added
        sortOrder: i,
        variants: { create: p.packs.map(([label, price, stock], k) => ({ label, price: price || 1, mrp: price || 1, stock, sortOrder: k })) },
        concerns: concern ? { create: [{ concernId: concern.id }] } : undefined,
      },
    });
  }

  const doctors = [
    { name: "Dr Sachith Roy", slug: "dr-sachith-roy", sortOrder: 1 },
    { name: "Dr Ambika Roy", slug: "dr-ambika-roy", sortOrder: 2 },
  ];
  for (const d of doctors) {
    const doc = await db.doctor.upsert({ where: { slug: d.slug }, update: {}, create: { ...d, qualifications: "BAMS", languages: ["Malayalam", "English"] } });
    if ((await db.availability.count({ where: { doctorId: doc.id } })) === 0) {
      // Placeholder hours: Mon–Sat, 10:00–12:30 and 16:30–19:00 IST. Change under Doctors & timings.
      const rows = [1, 2, 3, 4, 5, 6].flatMap((weekday) => [
        { doctorId: doc.id, weekday, startMin: 600, endMin: 750 },
        { doctorId: doc.id, weekday, startMin: 990, endMin: 1140 },
      ]);
      await db.availability.createMany({ data: rows });
    }
  }

  const types = [
    { key: "video", name: "Video call", description: "Link sent on WhatsApp", durationMin: 20, sortOrder: 1 },
    { key: "phone", name: "Phone call", description: "The doctor calls you", durationMin: 15, sortOrder: 2 },
    { key: "clinic", name: "In-clinic visit", description: "At our Kadavanthra clinic", durationMin: 30, sortOrder: 3 },
  ];
  for (const t of types) await db.consultationType.upsert({ where: { key: t.key }, update: {}, create: { ...t, fee: null } });

  for (const [s, title, content] of pages) await db.page.upsert({ where: { slug: s }, update: {}, create: { slug: s, title, content } });

  // About us: one page with sections, plus separate Accreditations and CSR pages, and the “About us ▾” menu.
  const about = await db.page.findUnique({ where: { slug: "about-us" }, include: { blocks: true } });
  if (about && about.blocks.length === 0) {
    await db.page.update({ where: { id: about.id }, data: { title: "About NUPAL", content: "" } });
    await db.pageBlock.createMany({
      data: [
        { pageId: about.id, type: "text", title: "About NUPAL", anchor: "about-nupal", sortOrder: 1, data: { body: "New Udaya Pharmacy & Ayurvedic Laboratories (NUPAL) was shaped through many generations that have strived for excellence in unique, life-saving Ayurvedic medicines.\n\n[Add NUPAL’s story in Admin → Pages & policies → About NUPAL.]", imageSide: "right" } },
        { pageId: about.id, type: "text", title: "Vision & Mission", anchor: "vision-mission", sortOrder: 2, data: { body: "**Our vision**\n\n[Add vision]\n\n**Our mission**\n\n[Add mission]", imageSide: "right" } },
        { pageId: about.id, type: "message", title: "Chairman’s Message", anchor: "chairmans-message", sortOrder: 3, data: { name: "[Chairman’s name]", role: "Chairman", body: "[Add the chairman’s message]" } },
        { pageId: about.id, type: "people", title: "Management", anchor: "management", sortOrder: 4, data: { people: [{ name: "[Name]", role: "[Role]", bio: "" }] } },
        { pageId: about.id, type: "logos", title: "Our Associates", anchor: "our-associates", sortOrder: 5, data: { logos: [{ name: "[Associate name]", url: "" }] } },
      ],
    });
  }
  for (const [slug, title, blocks] of [
    ["accreditations", "Accreditations & Approvals", [
      { type: "text", title: "", anchor: "", data: { body: "NUPAL’s manufacturing is certified to GMP, WHO-GMP and ISO 9001:2015 standards. [Confirm and add licence details.]" } },
      { type: "gallery", title: "Certificates", anchor: "certificates", data: { images: [] } },
    ]],
    ["csr", "CSR", [
      { type: "text", title: "", anchor: "", data: { body: "[Add NUPAL’s CSR activities.]" } },
      { type: "gallery", title: "Photos", anchor: "photos", data: { images: [] } },
    ]],
  ] as const) {
    if (await db.page.findUnique({ where: { slug } })) continue;
    await db.page.create({ data: { slug, title, content: "", inFooter: false, blocks: { create: blocks.map((b, i) => ({ ...b, data: b.data as object, sortOrder: i + 1 })) } } });
  }
  await db.page.updateMany({ where: { slug: { in: ["accreditations", "csr"] } }, data: { inAboutMenu: true } });

  if ((await db.banner.count()) === 0) {
    await db.banner.createMany({
      data: [
        { title: "Generations of Ayurvedic care, from Kochi", subtitle: "Medicines for liver care, digestion, heart health, immunity, hair and women’s health.", ctaLabel: "Shop bestsellers", ctaHref: "/#bestsellers", theme: "cream", sortOrder: 1 },
        { title: "Not sure what’s right for you?", subtitle: "Talk to our Ayurvedic doctors by video, phone or at the clinic. Book in under a minute.", ctaLabel: "Book a consultation", ctaHref: "/consult", theme: "green", sortOrder: 2 },
      ],
    });
  }

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@nupalremedies.com").toLowerCase();
  if (!(await db.user.findUnique({ where: { email } }))) {
    await db.user.create({
      data: { name: "NUPAL Admin", email, role: "OWNER", passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe@123", 10) },
    });
    console.log(`Created owner login: ${email}`);
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
