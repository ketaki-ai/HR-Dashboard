# PMM Recruitment Dashboard — Deployment Guide

## Exact steps. No fluff. Copy-paste-deploy.

---

## STEP 1 — Prerequisites

Install these on your machine:
- Node.js 18+ → https://nodejs.org
- Git → https://git-scm.com
- Vercel CLI → `npm i -g vercel`

---

## STEP 2 — Database Setup (Neon — free tier, 5 min)

1. Go to https://neon.tech → Sign up → Create Project → Name it `pmm-dashboard`
2. Copy the **Connection string** → looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. You need TWO URLs:
   - `DATABASE_URL` → Add `?pgbouncer=true&connection_limit=1` to the end
   - `DIRECT_URL` → Same URL without the extra params

---

## STEP 3 — Vercel Blob Setup (for CV file storage)

1. Go to https://vercel.com → Dashboard → Storage → Create → Blob Store
2. Name it `pmm-cvs`
3. Click `.env.local` button → Copy the `BLOB_READ_WRITE_TOKEN`

---

## STEP 4 — Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local

# 3. Fill in .env.local with your actual values:
#    DATABASE_URL=...
#    DIRECT_URL=...
#    BLOB_READ_WRITE_TOKEN=...
#    CRON_SECRET=any-random-string-you-choose

# 4. Push database schema
npx prisma db push

# 5. Seed with existing data
npx tsx scripts/seed.ts

# 6. Add PMM logo
# Copy your PMM logo file to:  public/pmm-logo.png

# 7. Run locally
npm run dev
# → Open http://localhost:3000
```

---

## STEP 5 — Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts — select "Next.js" framework)
vercel

# Set environment variables on Vercel
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

OR deploy via GitHub (recommended):

```bash
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/pmm-dashboard.git
git push -u origin main
```

Then:
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Add all env variables in the UI
4. Click Deploy

---

## STEP 6 — Environment Variables (exact names)

Set ALL of these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Where to get |
|---|---|---|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true&connection_limit=1` | Neon dashboard |
| `DIRECT_URL` | `postgresql://...` | Neon dashboard |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` | Vercel Blob storage |
| `CRON_SECRET` | any random 32+ char string | You choose |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Vercel after deploy |

---

## STEP 7 — Auto CV Ingestion

### Option A: Local folder watcher (for HR team's computer)

```bash
# Set env vars locally
export NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
export CRON_SECRET=your-secret

# Start the watcher
npm run watch

# Now drop any CV (PDF/DOCX) into the ./cv-inbox folder
# It auto-uploads, parses, and adds to the live dashboard
```

### Option B: Dashboard upload button (anywhere, any browser)

1. Open the live dashboard
2. Click **"Upload CV"** button (top right)
3. Drag & drop or browse for PDF/DOCX
4. Auto-parsed and added in ~5 seconds

---

## STEP 8 — Auto Refresh

The dashboard auto-refreshes in 3 ways:

1. **Client polling** — Every 30 seconds, browser fetches fresh data (zero config)
2. **ISR** — Next.js revalidates server pages every 60 seconds
3. **Vercel Cron** — Every 5 minutes, `/api/cron` saves analytics snapshot and triggers revalidation

No manual reload ever needed.

---

## FILE STRUCTURE

```
pmm-dashboard/
├── app/
│   ├── api/
│   │   ├── candidates/
│   │   │   ├── route.ts          # GET all, POST new
│   │   │   └── [id]/route.ts     # PATCH, DELETE
│   │   ├── upload/route.ts       # CV upload + parse
│   │   ├── analytics/route.ts    # Computed analytics
│   │   └── cron/route.ts         # Scheduled revalidation
│   ├── layout.tsx
│   ├── page.tsx                  # Server component (ISR)
│   └── globals.css
├── components/
│   └── dashboard/
│       ├── DashboardClient.tsx   # Main client shell + auto-refresh
│       ├── Header.tsx
│       ├── NavTabs.tsx
│       ├── UIKit.tsx             # StatCard, Card, BarList, etc.
│       ├── OverviewView.tsx
│       ├── PipelineView.tsx
│       ├── ProfilesView.tsx
│       ├── OffersView.tsx
│       ├── AnalyticsView.tsx
│       ├── UploadModal.tsx
│       └── FooterStrip.tsx
├── lib/
│   ├── prisma.ts                 # Prisma singleton
│   ├── cv-parser.ts              # PDF/DOCX text extraction
│   ├── analytics.ts              # Compute aggregations
│   └── utils.ts                  # fmtCTC, fmtDate, etc.
├── prisma/
│   └── schema.prisma             # DB schema
├── scripts/
│   ├── seed.ts                   # Seed with existing data
│   └── cv-watcher.ts             # Local folder watcher
├── public/
│   └── pmm-logo.png              # ← PUT YOUR LOGO HERE
├── .env.example
├── .env.local                    # ← YOUR ACTUAL SECRETS (gitignored)
├── vercel.json                   # Cron config
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## TROUBLESHOOTING

**"Cannot connect to database"**
→ Check `DATABASE_URL` has `?pgbouncer=true&connection_limit=1`
→ Run `npx prisma db push` to create tables

**"Blob upload failed"**
→ CV still saved to DB without file URL — this is OK
→ Check `BLOB_READ_WRITE_TOKEN` is set correctly

**"Logo not showing"**
→ Make sure `public/pmm-logo.png` exists
→ Filename must match exactly

**Cron not running on free Vercel**
→ Cron jobs require Vercel Pro ($20/mo)
→ Free alternative: use client-side 30s polling (already built in)

---

## TECH STACK SUMMARY

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| File Storage | Vercel Blob |
| CV Parsing | pdf-parse + mammoth |
| Deployment | Vercel |
| Auto Refresh | ISR + Client polling + Cron |
