# Daybook (repo: quickbooks-mock)

A personal life-OS — single-user. Money, tasks, habits, goals, notes, and
journal in one place. Mobile-first, syncs across phone and PC via Supabase.

> Live at **https://quickbooks-mock.vercel.app**.

> See [`CLAUDE.md`](./CLAUDE.md) for the full project guide. Start any
> Claude session with **"Read CLAUDE.md, then [task]."**

## Modules
- **Money:** income, expenses, categories, accounts (with net worth)
- **Productivity:** tasks (with projects + priorities); habits / goals are next
- **Knowledge:** notes / journal (skeletons — coming next)

## Stack
- Next.js 14 (App Router) + TypeScript
- Supabase Postgres + Auth (magic-link email)
- Tailwind CSS, lucide-react icons
- React Hook Form + Zod
- Vercel hosting (auto-deploy on push to `main`)

## Deploy in one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstharpe98-tech%2FQuickbooks-mock&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Get%20these%20from%20your%20Supabase%20project%3A%20Settings%20%E2%86%92%20API&envLink=https%3A%2F%2Fsupabase.com%2Fdashboard%2Fproject%2F_%2Fsettings%2Fapi&project-name=quickbooks-mock&repository-name=quickbooks-mock)

After deploy: in Supabase → Authentication → URL Configuration set Site URL
to your `https://*.vercel.app` URL and add `https://*.vercel.app/**` to
Redirect URLs so magic-link login works.

## Local development

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY (from Supabase → Project Settings → API)
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts
- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`

## Migrations
All schema lives in [`supabase/migrations/`](./supabase/migrations/). Apply
new migrations either via Supabase's SQL Editor or via the Management API
(see CLAUDE.md). The schema currently in production is `0002_life_os.sql`.

## Notes
- **Money is integer cents** — never floats. See `src/lib/money.ts`.
- **All DB access goes through `src/lib/db/`**. Pages and components never
  call Supabase directly.
- **RLS is enforced** at the database level: every row is scoped by
  `user_id = auth.uid()`.
- This is a personal tool, not financial / accounting software.
