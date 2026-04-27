# quickbooks-mock

A simple bookkeeping web app — customers, invoices, expenses, and a basic
dashboard. Single-user. Mobile-first. Data lives in Supabase, so it syncs
across every device you sign in on.

> See [`CLAUDE.md`](./CLAUDE.md) for the full project guide. Start any
> Claude session with **"Read CLAUDE.md, then [task]."**

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase Postgres + Auth (magic-link email)
- Tailwind CSS
- React Hook Form + Zod
- Vercel (hosting)

## Quick start

### 1. Create a Supabase project

1. Go to <https://supabase.com> and create a free project.
2. In **Project Settings → API**, copy the project URL, the `anon` public key,
   and the `service_role` key.
3. In **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
   and run it.
4. In **Authentication → Providers**, make sure **Email** is enabled. The
   default magic-link flow is what this app uses.
5. In **Authentication → URL Configuration**, set the **Site URL** to your
   deployed URL (e.g. `https://quickbooks-mock.vercel.app`) and add
   `http://localhost:3000` to **Additional Redirect URLs** for local dev.

### 2. Configure env vars

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SITE_URL
```

### 3. Install + run

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with your email.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`

## Deploy

Push to `main` after connecting the repo to Vercel. Set the same env vars in
**Vercel → Project Settings → Environment Variables**.

## Notes

- **Money is integer cents** — never floats. See `src/lib/money.ts`.
- **All DB access goes through `src/lib/db/`**. Pages and components never
  call Supabase directly.
- **RLS is enforced** at the database level: every row is scoped by
  `user_id = auth.uid()`. The schema is in `supabase/migrations/0001_init.sql`.
- This is a learning project, not real accounting software.
