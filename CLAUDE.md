# Project Guide: QuickBooks Mock (quickbooks-mock)

## How I work with Claude
- **One source of truth:** this file. Never retype context between sessions.
- **Start any session with:** "Read CLAUDE.md, then [task]."
- **When something changes:** say "update CLAUDE.md with X" and commit.
- **Cowork (chat app):** planning, docs, GitHub, cross-project stuff.
- **Claude Code (CLI):** building inside this repo.

## What this app is
A simple bookkeeping tool — single-user to start. Track customers, send
invoices, log expenses, see a basic dashboard. Not a real QuickBooks
replacement; a learning project.

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Deploy: push to `main` (Vercel auto-deploys)

## Tech Stack
- Framework: Next.js 14+ (App Router) + TypeScript
- DB: Supabase Postgres (access via `@supabase/supabase-js`)
- Auth: Supabase Auth (email magic links)
- Host: Vercel
- Styling: Tailwind CSS
- Forms/validation: React Hook Form + Zod
- PDF (later): `@react-pdf/renderer` for invoice exports

## Required Environment Variables
Set in Vercel project settings + local `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never expose)

## File Layout
- `src/app/` — App Router routes
  - `(auth)/login/` — magic link login
  - `(app)/dashboard/` — totals + recent activity
  - `(app)/customers/` — list, new, [id]
  - `(app)/invoices/` — list, new, [id]
  - `(app)/expenses/` — list, new
- `src/lib/supabase/` — client + server Supabase helpers
- `src/lib/db/` — typed query helpers (all DB access goes through here)
- `src/components/` — shared UI
- `supabase/migrations/` — SQL schema migrations

## Rules for "Perfection"
- **Mobile First:** Design for small screens first; scale up with `md:` / `lg:`.
- **Money is integers (cents).** Never store dollars as floats. `$10.50` = `1050`.
- **Server Components by default.** Use `"use client"` only when you need state/effects.
- **All DB access through `src/lib/db/`.** No raw Supabase calls in pages.
- **Validate at the edge.** Zod schemas for every form + API route input.
- **Always provide a Plan before writing code.**

## Design Direction
- Friendly, colorful, easy to navigate. Trust still matters, but the app
  should feel inviting — not a tax-software gray box.
- Each section has its own accent color, defined once in
  `src/lib/theme.ts`:
  - Dashboard → emerald
  - Customers → sky
  - Invoices  → violet
  - Expenses  → amber
- Brand gradient: `from-indigo-500 via-violet-500 to-fuchsia-500`. Used on
  the brand mark and the login screen.
- Icons everywhere via `lucide-react` — every nav item, page header, stat
  card, and empty state gets a glyph.
- Tailwind defaults for spacing (4px scale matches Tailwind's `1` = `0.25rem` = `4px`).
- Tables for data-heavy views; gradient stat cards for dashboard summaries.

## Project-Specific Rules
- **No real financial advice / tax features.** This is a learning mockup.
- **One user per account for now.** Multi-tenant comes later, if ever.
- **Migrations only via `supabase/migrations/`** — never edit the DB by hand.
- **Secrets via Vercel + `.env.local` only** — never commit keys.
