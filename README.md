# NUPAL Remedies — website and admin panel

Next.js storefront, doctor-consultation booking and admin panel for New Udaya Pharmacy & Ayurvedic Laboratories (NUPAL), Kochi.

- **Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Prisma 6, Supabase (PostgreSQL + Storage)
- **Storefront:** home (banners, concern icons, bestsellers by concern, doctor section), shop and search, health-concern pages, product pages with pack sizes, cart, cash-on-delivery checkout, CMS pages (About, policies…), floating WhatsApp button
- **Consultations:** choose doctor and type → open slots worked out from each doctor’s weekly hours, leave days and existing bookings → short form → booking saved (no account needed)
- **Admin (`/admin`):** dashboard, orders (status, payment, Excel export), consultations (complete, cancel, reschedule, video link, mark paid), products (pack sizes, MRP/price, stock, photos, FAQs, SEO), health concerns, doctors (profile, photo, weekly hours, leave), customer reviews (approve, hide, reply, feature on homepage), video testimonials (YouTube links), homepage banners (desktop + mobile images), pages and policies, store settings (offer bar, delivery, COD, contact, consultation fees), staff logins with roles

---

## 1. Set up Supabase (once)

1. Create a project at [supabase.com](https://supabase.com). Choose the **Mumbai (ap-south-1)** region, and save the database password.
2. **Connect → ORMs → Prisma**: copy the two connection strings into `.env` as `DATABASE_URL` (port 6543) and `DIRECT_URL` (port 5432). Add `&schema=nupal` / `?schema=nupal` as shown in `.env.example` — this keeps the shop’s tables out of Supabase’s public Data API.
3. **Storage → New bucket**: name it `nupal` and turn on **Public bucket**. Product, banner and doctor photos are stored here.
4. **Project Settings → API**: copy the project URL into `SUPABASE_URL` and the **service_role** secret into `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Run it locally

Requirement: **Node.js 20+**.

```bash
npm install
cp .env.example .env      # fill in the Supabase values and AUTH_SECRET (openssl rand -base64 32)
npm run db:setup          # creates the tables in Supabase and loads NUPAL’s starter data
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin — sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, then change the password (sidebar → Change password).

`npm run db:studio` opens a database browser; the Supabase Table Editor (schema `nupal`) works too.
After changing `prisma/schema.prisma`, run `npm run db:push` to update the tables.

## 3. Publish to Vercel for client testing

1. Push the project to a GitHub repository (`.env` is git-ignored — never commit it).
2. In Vercel: **Add New → Project**, import the repository.
3. In **Settings → Environment Variables**, add the same values as your `.env`: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `AUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL` (the Vercel URL).
4. Deploy. The Vercel site uses the same Supabase database and photos as your local copy, so anything added in the admin panel shows in both.

Tip: for real client testing you may want a second Supabase project, so your local experiments don’t change what the client sees.

## 4. Moving to NUPAL’s own server later

The server needs **Node.js 20+**. The database can stay on Supabase, or move to the server’s own PostgreSQL (then leave the Supabase storage keys empty and photos are saved in `uploads/`). Before going live, switch from `db push` to versioned migrations:

```bash
npx prisma migrate dev --name init   # once, on a development database; commit prisma/migrations
npx prisma migrate deploy            # on the production database
npm run build && npm start           # run under PM2 / systemd behind Nginx
```

If their hosting is shared PHP-only hosting (no Node.js), it can’t run this app — they would need a VPS or Node-capable plan, or keep it on Vercel.

---

## Roles

| Role | Can use |
| --- | --- |
| Owner | Everything, including staff logins |
| Admin | Everything except staff |
| Doctor | Consultations (only their own, when linked to a doctor) and doctor timings |
| Order staff | Dashboard and orders |
| Content staff | Dashboard, products, concerns, banners, pages |

## Starter data notes (from nupalremedies.com)

- Product prices are the current site prices. MRP equals the price until NUPAL adds MRPs; stock is set to 25 (or 0 where the current site shows “Out of stock”).
- **Kamilari Capsules** is hidden because its price isn’t listed — add the price in Admin → Products and switch it on.
- Doctors’ hours are placeholders (Mon–Sat, 10:00–12:30 and 4:30–7:00 PM). Consultation fees are empty (“fee confirmed on booking”) until set in Store settings.
- Policy pages contain placeholders to replace in Admin → Pages & policies.

## Not built yet (next steps)

- Online payment gateway (bookings with a fee are saved as “Awaiting payment”; staff mark them paid)
- WhatsApp and email notifications — `src/lib/notify.ts` is the single place to connect them; for now events are logged
- Coupons and blog
