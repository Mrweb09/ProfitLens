---
name: project-profitlens
description: Full overview of the Profitlens / roastmysite project — stack, features, structure, and known issues
metadata:
  type: project
---

# Profitlens — AI Website Conversion Auditor

**tagline:** "Roast My Site" — enter a URL, get a brutal AI audit with scores, revenue estimates, action plan, and shareable roast.

## Stack
- Next.js 16 App Router (TypeScript)
- Clerk for auth (sign-in/sign-up pages, middleware, UserButton)
- PostgreSQL + Prisma (with `@prisma/adapter-pg` driver adapter)
- Groq (`llama-3.3-70b-versatile`) for ALL AI — audit analysis, chat, competitor analysis
- Stripe for payments (checkout, portal, webhook)
- Vercel Analytics
- Tailwind CSS v4, Radix UI primitives, Framer Motion, Recharts, jsPDF, html2canvas

## Plans
- Free: 1 audit total
- Starter: £49/mo, 10 audits/month
- Growth: £99/mo, 50 audits/month (most popular)
- Agency: £199/mo, unlimited audits

## Key pages / routes
- `/` — landing (Navbar, Hero, Features, Testimonials, Pricing, FAQ, Footer)
- `/sign-in`, `/sign-up` — Clerk hosted UI with dark theme
- `/dashboard` — audit list, stats (total audits, revenue opp, avg score)
- `/dashboard/new` — new audit form with animated step progress
- `/dashboard/audit/[id]` — full audit results (7 tabs: Findings, Top Fixes, Roast, Action Plan, AI Chat, Progress, Share)
- `/dashboard/competitor` — competitor comparison form
- `/dashboard/billing` — current plan + Stripe portal
- `/dashboard/settings` — Clerk UserProfile component
- `/audit/[id]` — public shareable page (roast visible, findings locked behind signup CTA)
- `/admin` — admin dashboard gated by `ADMIN_EMAIL` env var

## API routes
- `POST /api/audit/create` — creates audit record, fires async AI analysis, returns id immediately
- `GET|PATCH /api/audit/[id]` — get audit data / toggle isPublic
- `POST /api/audit/free` — unauthenticated free audit (in-memory IP rate limit, 1 per IP)
- `POST /api/audit/chat` — AI chat about an audit (Groq)
- `POST /api/competitor` — competitor analysis + gap report (Groq)
- `GET /api/score-history` — score trend for a URL
- `GET /api/stats` — total completed audits count (used by AuditCounter on landing)
- `POST /api/stripe/checkout` — create Stripe checkout session
- `POST /api/stripe/portal` — create Stripe billing portal session
- `POST /api/stripe/webhook` — handle checkout.session.completed, subscription.deleted, invoice.payment_succeeded
- `PATCH /api/action-item/[id]` — toggle action item done state
- `POST /api/user/sync` — upsert Clerk user into DB

## Audit engine (lib/audit-engine.ts)
Four exported functions, all using Groq:
1. `analyzeWebsite(url)` — fetches HTML, extracts key elements, sends to Groq, returns scores + findings + roast
2. `analyzeCompetitor(url)` — returns scores + analysis object for a competitor URL
3. `generateActionPlan(url, findings)` — returns 10-15 specific action tasks
4. `generateCompetitorGapReport(...)` — AGENCY only, returns gap list

## Components
- `audit/score-ring` — SVG circular progress ring
- `audit/recommendation-card` — finding card with priority badge, fix box, revenue impact
- `audit/action-plan` — checklist with progress bar, expandable items, persists done state to API
- `audit/ai-chat` — chat UI, sends last 6 messages as history to Groq
- `audit/auto-refresh` — silent component that calls router.refresh() on interval (used on ANALYZING status)
- `audit/export-pdf-button` — jsPDF export with branded header, scores, findings
- `audit/share-button` — makes audit public via PATCH, copies shareable URL
- `audit/share-card` — downloadable branded PNG via html2canvas
- `audit/score-history-chart` — Recharts line chart, fetches from /api/score-history
- `landing/audit-counter` — fetches /api/stats, adds 2847 (social proof padding)
- `dashboard/sidebar` — nav with Clerk UserButton
- `dashboard/manage-billing-button` — opens Stripe portal
- `dashboard/upgrade-section` — plan cards with Stripe checkout

## Known bugs / issues
1. **CRITICAL: middleware named `proxy.ts` instead of `middleware.ts`** — Next.js only runs middleware from a file called `middleware.ts` at root. Clerk auth middleware is NOT running. Individual page-level auth checks still work but the blanket route protection is broken.
2. **`lib/openai.ts` is dead code** — OpenAI client initialized but never imported anywhere. App uses Groq exclusively.
3. **`GROQ_API_KEY` missing from `.env.example`** — env example has `OPENAI_API_KEY` instead. Anyone setting up from example will be missing the actual required key.
4. **FAQ says "GPT-4o"** — inaccurate; app uses Groq/Llama.
5. **Free audit rate limit is in-memory** — resets on server restart, not production-safe.

**Why these matter:** The middleware bug means unauthenticated crawlers/bots can reach dashboard URL paths (though server-side Clerk checks still redirect them). The env example issue will break new setups.
