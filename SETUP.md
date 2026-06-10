# Profitlens — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Accounts: Clerk, Stripe, OpenAI

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### Required services:

**Clerk** (auth) — https://clerk.com
- Create app → copy publishable key + secret key
- Set redirect URLs: `/sign-in`, `/sign-up`, `/dashboard`

**OpenAI** — https://platform.openai.com
- Create API key (GPT-4o access needed)

**Stripe** — https://stripe.com
- Create 3 products with monthly prices: Starter £49, Growth £99, Agency £199
- Copy the Price IDs into env vars
- Set up webhook → `/api/stripe/webhook` → events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`

**PostgreSQL**
- Any provider works: Neon, Supabase, Railway, or local
- Copy connection string to `DATABASE_URL`

## 2. Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Or push schema directly (faster for dev)
npx prisma db push
```

## 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all env vars in Vercel dashboard → Settings → Environment Variables.

After deploy, update Clerk redirect URLs and Stripe webhook URL to your production domain.

## 5. Admin Panel

Set `ADMIN_EMAIL` env var to your email address to access `/admin`.

## Revenue Potential

With this stack:
- **Starter** (£49/mo): Break even at ~1 paying user
- **Growth** (£99/mo): £10k MRR = ~100 Growth users
- **Agency** (£199/mo): £10k MRR = ~50 Agency users

Marketing channels that work best:
- TikTok demos showing a website getting roasted
- LinkedIn posts sharing real audit results
- Cold email to eCommerce stores, agencies, SaaS founders
- SEO targeting "website conversion audit", "why is my website not converting"

## File Structure

```
app/
  page.tsx              # Landing page
  dashboard/
    page.tsx            # Dashboard home
    new/page.tsx        # New audit form
    audit/[id]/page.tsx # Audit results
    competitor/page.tsx # Competitor comparison
    billing/page.tsx    # Billing management
    settings/page.tsx   # Account settings
  audit/[id]/page.tsx   # Public shareable audit
  admin/page.tsx        # Admin dashboard
  api/
    audit/create/       # POST: create audit
    audit/[id]/         # GET/PATCH: audit data
    stripe/checkout/    # POST: create checkout
    stripe/webhook/     # POST: Stripe events
    stripe/portal/      # POST: billing portal
    competitor/         # POST: competitor analysis
    user/sync/          # POST: sync Clerk user

components/
  landing/              # Landing page sections
  dashboard/            # Dashboard components
  audit/                # Audit result components
  ui/                   # Base UI components

lib/
  prisma.ts             # Database client
  stripe.ts             # Stripe client + plans
  openai.ts             # OpenAI client
  audit-engine.ts       # AI analysis logic
  utils.ts              # Helpers
```
