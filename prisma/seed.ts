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
  // New About sections: story opening and numbers at the top, milestones and values at the end (added once).
  const aboutNow = await db.page.findUnique({ where: { slug: "about-us" }, include: { blocks: true } });
  if (aboutNow && !aboutNow.blocks.some((b) => b.type === "intro")) {
    await db.pageBlock.createMany({
      data: [
        { pageId: aboutNow.id, type: "intro", title: "Since [year]", anchor: "our-story", sortOrder: -2, data: { eyebrow: "Our story", body: "New Udaya Pharmacy & Ayurvedic Laboratories (NUPAL) was shaped through many generations that have strived for excellence in unique, life-saving Ayurvedic medicines.\n\n[Add a few lines about how NUPAL began.]", name: "[Founder’s name]", role: "Founder" } },
        { pageId: aboutNow.id, type: "stats", title: "", anchor: "", sortOrder: -1, data: { stats: [{ value: 100, suffix: "+", label: "Ayurvedic formulations" }, { value: 10000, suffix: "+", label: "Hair regrowth results" }, { value: 3, suffix: "", label: "Quality certifications" }, { value: 2, suffix: "", label: "Ayurvedic experts" }] } },
        { pageId: aboutNow.id, type: "timeline", title: "Our journey", anchor: "our-journey", sortOrder: 50, data: { items: [{ year: "[Year]", title: "NUPAL founded in Kochi", text: "[Add details]" }, { year: "[Year]", title: "[Milestone]", text: "" }, { year: "[Year]", title: "GMP and ISO 9001 certification", text: "" }, { year: "Today", title: "Medicines and expert care online", text: "" }] } },
        { pageId: aboutNow.id, type: "cards", title: "What we stand for", anchor: "what-we-stand-for", sortOrder: 51, data: { intro: "", cards: [{ title: "Authentic formulations", text: "Classical and proprietary medicines made the traditional way." }, { title: "Certified manufacturing", text: "Made in Kochi under GMP, WHO-GMP and ISO 9001 standards." }, { title: "Expert guidance", text: "Ayurvedic experts to help you choose the right care." }, { title: "Care that lasts", text: "Generations of trust from families across Kerala." }] } },
      ],
    });
  }
  // About page redesign: add Founder + Vision/Mission cards, put sections in the approved order,
  // and remove leftover placeholder brackets from the chairman’s message. Safe to run again.
  const aboutPage = await db.page.findUnique({ where: { slug: "about-us" }, include: { blocks: true } });
  if (aboutPage) {
    if (!aboutPage.blocks.some((b) => b.type === "founder")) {
      await db.pageBlock.create({
        data: {
          pageId: aboutPage.id, type: "founder", title: "Our story is written in our DNA", anchor: "the-founder", sortOrder: 3,
          data: {
            eyebrow: "The founder",
            quote: "Late Sri N. K. Padmanabhan Vaidyar’s gift was to find the root cause of illness — and treat it the Ayurvedic way.",
            body: "His knowledge and inborn talent to diagnose the root causes of illness, and to save many lives from their terminally ill stages, made him world-renowned. He formulated over forty new medicines and is one of only eleven physicians honoured with **Vaidyavachaspathy**, the ultimate title in Ayurveda.\n\nHis knowledge lives on in every NUPAL medicine — like the DNA in a family.",
            badge: "Vaidyavachaspathy",
            badgeSub: "Ayurveda’s highest title",
          },
        },
      });
    }
    if (!aboutPage.blocks.some((b) => b.type === "duo")) {
      await db.pageBlock.create({
        data: {
          pageId: aboutPage.id, type: "duo", title: "Why we do what we do", anchor: "vision-and-mission", sortOrder: 4,
          data: {
            eyebrow: "Vision & mission",
            cards: [
              { title: "A vision that transcended time", text: "To revive Ayurveda by making it available to the world — packaging traditional formulations into convenient tablets and capsules while keeping their effectiveness intact." },
              { title: "A mission to sustain healthy living", text: "To extend Ayurveda’s life-sustaining benefits to everyone, with a research team and a state-of-the-art facility conforming to CGMP as per WHO guidelines." },
            ],
          },
        },
      });
    }
    // Approved order. The older “About NUPAL” and “Vision & Mission” text sections go to the end so they can be deleted.
    const order: Record<string, number> = { intro: 1, stats: 2, founder: 3, duo: 4, timeline: 5, cards: 6, message: 7, people: 8, logos: 9, gallery: 10 };
    const fresh = await db.pageBlock.findMany({ where: { pageId: aboutPage.id } });
    for (const b of fresh) {
      const n = b.type === "text" ? 20 : order[b.type] ?? 15;
      if (b.sortOrder !== n) await db.pageBlock.update({ where: { id: b.id }, data: { sortOrder: n } });
      if (b.type === "message") {
        const m = (b.data ?? {}) as { body?: string };
        if (m.body && /\[Add the chairman|sage\]\s*$/.test(m.body)) {
          const body = m.body.replace(/^\s*\[Add the chairman[’']s mes/, "").replace(/sage\]\s*$/, "").trim();
          await db.pageBlock.update({ where: { id: b.id }, data: { data: { ...(b.data as object), body } } });
        }
      }
    }
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
  // Team direction: six lead concerns with short lines, shown first on the homepage (only while taglines are empty).
  const lead: [string, string][] = [
    ["liver-health", "Everyday liver support"],
    ["heart-health", "Traditional heart care"],
    ["digestion-acidity", "Comfort after meals"],
    ["hair-care", "Nourishing hair care"],
    ["womens-health", "Support through every stage"],
    ["cough-throat", "Herbal comfort, season to season"],
  ];
  if (!(await db.concern.count({ where: { tagline: { not: "" } } }))) {
    for (const [i, [slug, tagline]] of lead.entries()) await db.concern.updateMany({ where: { slug }, data: { tagline, sortOrder: i + 1 } });
    const rest = await db.concern.findMany({ where: { slug: { notIn: lead.map((l) => l[0]) } }, orderBy: { sortOrder: "asc" } });
    for (const [i, c] of rest.entries()) await db.concern.update({ where: { id: c.id }, data: { sortOrder: 10 + i } });
  }
  const siteDir = await db.setting.findUnique({ where: { id: "site" } });
  if (siteDir && (!Array.isArray(siteDir.homeCollections) || !siteDir.homeCollections.length)) {
    await db.setting.update({
      where: { id: "site" },
      data: {
        homeCollections: [
          { title: "Everyday Wellness", text: "Explore Ayurvedic formulations for daily wellness and general wellbeing.", href: "/shop" },
          { title: "Traditional Ayurvedic Formulations", text: "Discover classical Ayurvedic preparations rooted in traditional practice.", href: "/shop" },
        ],
        offerMessages: ["Cash on Delivery Available", "Consult Our Ayurvedic Doctors", "Ayurvedic Formulations Crafted in Kerala"],
        whyPoints: [
          { title: "Traditional Formulations", text: "Inspired by classical Ayurvedic knowledge." },
          { title: "Quality Focused", text: "Prepared and checked with care." },
          { title: "Made in Kerala", text: "Rooted in Kerala’s Ayurvedic tradition." },
          { title: "Expert Guidance", text: "Qualified Ayurvedic physicians, one booking away." },
        ],
      },
    });
  }
  // “Why Nupal” section: replace the earlier starter text (only if it is unchanged).
  const herNow = (await db.setting.findUnique({ where: { id: "site" } }))?.heritage as Record<string, unknown> | null;
  if (herNow && herNow.title === "Our story is written\nin our DNA") {
    await db.setting.update({
      where: { id: "site" },
      data: {
        heritage: {
          show: true,
          eyebrow: "Our story, in brief",
          title: "Rooted in Tradition.\nCommitted to Your Wellbeing.",
          quote: "",
          body: "Nupal began in 1960 in Kochi, when Sri N. K. Padmanabhan Vaidyar, honoured with the title Vaidyavachaspathy, set up an Ayurvedic research centre to bring Ayurveda to everyday families. Our story is written in our DNA.",
          year: 1960,
          stats: [
            { value: "1960", suffix: "", label: "Founded in Kochi" },
            { value: "CGMP", suffix: "", label: "Guideline-based facility" },
            { value: "Doctors", suffix: "", label: "Guidance on call" },
          ],
          certs: ["GMP", "WHO-GMP", "ISO 9001", "AYUSH"],
          ctaLabel: "Discover Our Story →",
          ctaHref: "/about-us",
        },
      },
    });
  }
  // The first starter banner gets the team’s hero wording (only if unchanged).
  await db.banner.updateMany({
    where: { title: "Kerala Ayurveda,\nprescribed with care." },
    data: { eyebrow: "Rooted in Ayurveda. Made with care.", title: "Ancient Wisdom.\nEveryday Wellness.", subtitle: "Ayurvedic formulations for everyday health, made in Kochi since 1960 and backed by qualified Ayurvedic doctors.", ctaLabel: "Shop Now", ctaHref: "/shop" },
  });

  // Homepage heritage band (DNA): starting content, only if not set yet.
  const siteNow = await db.setting.findUnique({ where: { id: "site" } });
  const her = siteNow?.heritage as Record<string, unknown> | null;
  if (siteNow && (!her || !Object.keys(her).length)) {
    await db.setting.update({
      where: { id: "site" },
      data: {
        heritage: {
          show: true,
          eyebrow: "Our story, in brief",
          title: "Rooted in Tradition.\nCommitted to Your Wellbeing.",
          quote: "",
          body: "Nupal began in 1960 in Kochi, when Sri N. K. Padmanabhan Vaidyar, honoured with the title Vaidyavachaspathy, set up an Ayurvedic research centre to bring Ayurveda to everyday families. Our story is written in our DNA.",
          year: 1960,
          stats: [
            { value: "1960", suffix: "", label: "Founded in Kochi" },
            { value: "CGMP", suffix: "", label: "Guideline-based facility" },
            { value: "Doctors", suffix: "", label: "Guidance on call" },
          ],
          certs: ["GMP", "WHO-GMP", "ISO 9001", "AYUSH"],
          ctaLabel: "Discover Our Story →",
          ctaHref: "/about-us",
        },
      },
    });
  }
  // Accreditations and CSR are linked from the footer.
  await db.page.updateMany({ where: { slug: { in: ["accreditations", "csr"] } }, data: { inFooter: true } });
  const site = await db.setting.findUnique({ where: { id: "site" } });
  if (site && (!Array.isArray(site.whyPoints) || site.whyPoints.length === 0)) {
    await db.setting.update({
      where: { id: "site" },
      data: {
        whyPoints: [
          { title: "Generations of practice", text: "Classical and proprietary Ayurvedic formulations" },
          { title: "GMP · WHO-GMP · ISO 9001", text: "Certified manufacturing in Kochi" },
          { title: "Doctor support", text: "Consult our physicians before you buy" },
          { title: "Cash on delivery", text: "Pay when your order arrives" },
        ],
      },
    });
  }

  // Update the first starter banner to the new hero wording (only if it still has the original text).
  await db.banner.updateMany({
    where: { title: "Generations of Ayurvedic care, from Kochi" },
    data: { eyebrow: "Rooted in Ayurveda. Made with care.", title: "Ancient Wisdom.\nEveryday Wellness.", subtitle: "Ayurvedic formulations for everyday health, made in Kochi since 1960 and backed by qualified Ayurvedic doctors.", ctaLabel: "Shop Now", ctaHref: "/shop", theme: "green" },
  });
  // The four photo banners from NUPAL (Nov 2026). They replace the two starter text banners once.
  const PHOTO_BANNERS = [
    { eyebrow: "Excellence in Ayurveda since 1960", title: "Ancient Wisdom.\nEveryday Wellness.", subtitle: "Discover Kamilari Plus, rooted in Nupal’s longstanding Ayurvedic tradition and commitment to thoughtful formulations.", ctaLabel: "Explore Kamilari Plus", ctaHref: "/shop?q=kamilari", theme: "cream", imageDesktop: "/banners/kamilari-desktop.webp", imageMobile: "/banners/kamilari-mobile.webp" },
    { eyebrow: "Personal care, rooted in Ayurveda", title: "Thoughtful Care.\nFor Every Health Journey.", subtitle: "Explore Ayurvedic formulations designed around different health and wellness needs.", ctaLabel: "Shop by Concern", ctaHref: "/#concerns", theme: "green", imageDesktop: "/banners/collection-desktop.webp", imageMobile: "/banners/collection-mobile.webp" },
    { eyebrow: "The art of Ayurvedic hair care", title: "Nourish Your Hair.\nHonour Your Roots.", subtitle: "Discover Hairomax, a natural hair-fortifying oil inspired by traditional Ayurvedic hair care.", ctaLabel: "Explore Hairomax", ctaHref: "/shop?q=hairomax", theme: "green", imageDesktop: "/banners/hairomax-desktop.webp", imageMobile: "/banners/hairomax-mobile.webp" },
    { eyebrow: "The beauty of traditional Ayurveda", title: "A Ritual of\nTimeless Beauty.", subtitle: "Rediscover traditional Ayurvedic beauty care with Sumangaly.", ctaLabel: "Explore Sumangaly", ctaHref: "/shop?q=sumangaly", theme: "brown", imageDesktop: "/banners/sumangaly-desktop.webp", imageMobile: "/banners/sumangaly-mobile.webp" },
  ];
  if ((await db.banner.count({ where: { imageDesktop: "/banners/kamilari-desktop.webp" } })) === 0) {
    await db.banner.deleteMany({ where: { imageDesktop: null, title: { in: ["Ancient Wisdom.\nEveryday Wellness.", "Not sure what’s right?\nAsk our experts."] } } });
    await db.banner.createMany({ data: PHOTO_BANNERS.map((x, i) => ({ ...x, sortOrder: i + 1, active: true })) });
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
