# quickbooks-mock

A simple bookkeeping web app — customers, invoices, expenses, and a basic
dashboard. Single-user. Mobile-first. Data lives in Supabase, so it syncs
across every device you sign in on.

> See [`CLAUDE.md`](./CLAUDE.md) for the full project guide. Start any
> Claude session with **"Read CLAUDE.md, then [task]."**

## Deploy in one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstharpe98-tech%2FQuickbooks-mock&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Get%20these%20from%20your%20Supabase%20project%3A%20Settings%20%E2%86%92%20API&envLink=https%3A%2F%2Fsupabase.com%2Fdashboard%2Fproject%2F_%2Fsettings%2Fapi&project-name=quickbooks-mock&repository-name=quickbooks-mock)

Click the button, sign in to Vercel with GitHub, paste your three Supabase
keys when prompted, click Deploy. ~60 seconds later you have a live URL.

After the first deploy:

1. Open [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)
2. Set **Site URL** to your `https://*.vercel.app` URL
3. Add `https://*.vercel.app/**` to **Redirect URLs**

Login by magic link will then work on the live site.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase Postgres + Auth (magic-link email)
- Tailwind CSS, lucide-react icons
- React Hook Form + Zod
- `@react-pdf/renderer` for invoice PDFs

## Local development (optional)

If you want to run the app on your own machine instead:

### 1. Create a Supabase project

1. Go to <https://supabase.com> and create a free project.
2. **SQL Editor** → paste [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) → Run.
3. **Settings → API** → copy URL + `anon` key + `service_role` key.

### 2. Configure env vars

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY
```

### 3. Install + run

```bash
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

## Notes

- **Money is integer cents** — never floats. See `src/lib/money.ts`.
- **All DB access goes through `src/lib/db/`**. Pages and components never
  call Supabase directly.
- **RLS is enforced** at the database level: every row is scoped by
  `user_id = auth.uid()`. Schema in `supabase/migrations/0001_init.sql`.
- This is a learning project, not real accounting software.
