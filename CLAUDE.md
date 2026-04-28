# Project Guide: Daybook (repo: quickbooks-mock)

## How I work with Claude
- **One source of truth:** this file. Never retype context between sessions.
- **Start any session with:** "Read CLAUDE.md, then [task]."
- **When something changes:** say "update CLAUDE.md with X" and commit.
- **Cowork (chat app):** planning, docs, GitHub, cross-project stuff.
- **Claude Code (CLI):** building inside this repo.

## What this app is
**Daybook** — a personal life-OS. Single user (just me). Money + tasks +
habits + goals + notes + journal, in one app, syncing across phone and PC.

The repo name `quickbooks-mock` is legacy from when this was a freelance
bookkeeping tool. Don't bother renaming the repo — the brand inside the app
is "Daybook" and that's what matters.

## Modules
Sidebar is grouped by module. Each has its own accent color in `src/lib/theme.ts`.

| Group         | Section     | Accent  | Status    |
|---------------|-------------|---------|-----------|
| Overview      | Dashboard   | indigo  | live      |
| Money         | Income      | emerald | live      |
| Money         | Expenses    | rose    | live      |
| Money         | Categories  | slate   | live      |
| Money         | Accounts    | sky     | live      |
| Productivity  | Tasks       | violet  | live      |
| Productivity  | Habits      | amber   | stub (next) |
| Productivity  | Goals       | pink    | stub (next) |
| Knowledge     | Notes       | cyan    | stub (next) |
| Knowledge     | Journal     | teal    | stub (next) |

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Deploy: push to `main` (Vercel auto-deploys)

## Tech Stack
- Framework: Next.js 14+ (App Router) + TypeScript
- DB: Supabase Postgres (access via `@supabase/supabase-js` + `@supabase/ssr`)
- Auth: Supabase Auth (email magic links)
- Host: Vercel (project: `quickbooks-mock`, live at https://quickbooks-mock.vercel.app)
- Styling: Tailwind CSS
- Icons: lucide-react
- Forms/validation: React Hook Form + Zod

## Required Environment Variables
Set in Vercel project settings + local `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never expose)
- `NEXT_PUBLIC_SITE_URL` (defaults to runtime origin if unset)

## File Layout
- `src/app/` — App Router routes
  - `(auth)/login/` — magic link login
  - `(app)/dashboard/` — money + tasks roll-up
  - `(app)/income/` — list, new
  - `(app)/expenses/` — list, new
  - `(app)/categories/` — list + add per kind
  - `(app)/accounts/` — list + add, net worth cards
  - `(app)/tasks/` — list (filter by status), new
  - `(app)/habits/`, `goals/`, `notes/`, `journal/` — stubs
- `src/lib/supabase/` — client + server Supabase helpers
- `src/lib/db/` — typed query helpers (all DB access goes through here)
- `src/lib/theme.ts` — section accent palette + brand
- `src/components/` — shared UI
- `supabase/migrations/` — SQL schema migrations (`0001_init.sql` is legacy
  business schema, dropped in `0002_life_os.sql`)

## Rules for "Perfection"
- **Mobile First:** Design for small screens first; scale up with `md:` / `lg:`.
- **Money is integers (cents).** Never store dollars as floats. `$10.50` = `1050`.
- **Server Components by default.** Use `"use client"` only when you need state/effects.
- **All DB access through `src/lib/db/`.** No raw Supabase calls in pages.
- **Validate at the edge.** Zod schemas for every form + API route input.
- **Always provide a Plan before writing code.**

## Design Direction
- Friendly, colorful, easy to navigate. The app should feel inviting —
  not a tax-software gray box.
- Each section has its own accent color, defined once in `src/lib/theme.ts`.
- Brand gradient: `from-indigo-500 via-violet-500 to-fuchsia-500`. Used on
  the brand mark and the login screen.
- Brand icon: `NotebookPen` from lucide.
- Icons everywhere via `lucide-react` — every nav item, page header, stat
  card, and empty state gets a glyph.
- Tailwind defaults for spacing.
- Tables for data-heavy views; gradient stat cards for dashboard summaries;
  pill chips for status/category badges.

## Project-Specific Rules
- **Single user.** No multi-tenancy. Everything is scoped by RLS to `auth.uid()`.
- **No real financial advice / tax features.** This is a personal tool.
- **Migrations only via `supabase/migrations/`** — never edit the DB by hand.
  When applying a migration to live Supabase from a Claude session, use the
  Supabase Management API (`POST /v1/projects/{ref}/database/query`) with the
  Supabase Personal Access Token, or via the Supabase MCP server.
- **Secrets via Vercel + `.env.local` only** — never commit keys.

## Deploy infrastructure
- **GitHub:** `stharpe98-tech/Quickbooks-mock`
- **Vercel project ID:** `prj_NPTe3nk0qnFRBWaiwMzapI1fQnbw` (team `stharpe98-techs-projects`)
- **Supabase project ref:** `smvnhpbekldhequjcxec`
- **Supabase MCP:** registered in `.mcp.json`; OAuth-authenticated per session
- **Agent skills:** installed in `.agents/skills/` (Postgres best practices, Supabase docs)

## What's next (rough roadmap)
1. Habits module (daily/weekly habit tracking + 90-day heatmap)
2. Goals module (numeric + milestone goals with progress bars)
3. Notes module (markdown editor + tags + search)
4. Journal module (one entry per day + mood + calendar view)
5. Recurring bills (auto-create monthly expenses)
6. Budgets (per-category limits + progress)
7. Local-first desktop app (Tauri or Electron) with sync layer
