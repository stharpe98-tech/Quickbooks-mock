-- Personal life-OS pivot.
-- Drops the business-bookkeeping schema (customers, invoices, line items) and
-- introduces a personal finance + productivity + knowledge schema.
-- All tables remain owner-scoped via RLS (user_id = auth.uid()).

-- ─── Drop old business-bookkeeping tables ────────────────────────────────
drop table if exists invoice_line_items cascade;
drop table if exists invoices cascade;
drop table if exists customers cascade;
drop table if exists expenses cascade;

-- ─── Money: categories ───────────────────────────────────────────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  name text not null,
  color text,           -- short Tailwind palette name e.g. 'emerald'
  icon text,            -- lucide icon name e.g. 'shopping-cart'
  sort_order integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, kind, name)
);
create index categories_user_kind_idx on categories (user_id, kind, sort_order);

-- ─── Money: accounts (for net worth tracking) ────────────────────────────
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other')),
  balance_cents bigint not null default 0,
  currency text not null default 'USD',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index accounts_user_idx on accounts (user_id, archived, created_at desc);

-- ─── Money: income entries ───────────────────────────────────────────────
create table income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  source text not null,
  amount_cents bigint not null default 0,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index income_user_date_idx on income (user_id, date desc);

-- ─── Money: expenses ─────────────────────────────────────────────────────
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  vendor text not null,
  amount_cents bigint not null default 0,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index expenses_user_date_idx on expenses (user_id, date desc);

-- ─── Productivity: projects (containers for tasks) ───────────────────────
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index projects_user_idx on projects (user_id, archived, sort_order);

-- ─── Productivity: tasks ────────────────────────────────────────────────
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  notes text,
  due_at date,
  completed_at timestamptz,
  priority smallint not null default 0 check (priority between 0 and 3),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index tasks_user_open_idx on tasks (user_id, completed_at) where completed_at is null;
create index tasks_user_due_idx on tasks (user_id, due_at) where due_at is not null and completed_at is null;
create index tasks_project_idx on tasks (project_id, completed_at);

-- ─── Productivity: habits + entries ─────────────────────────────────────
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  target_per_period integer not null default 1,
  color text,
  icon text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index habits_user_idx on habits (user_id, archived);

create table habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  count integer not null default 1,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);
create index habit_entries_user_date_idx on habit_entries (user_id, date desc);

-- ─── Productivity: goals ────────────────────────────────────────────────
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  kind text not null default 'milestone' check (kind in ('milestone', 'numeric')),
  target_value numeric,
  current_value numeric not null default 0,
  unit text,                          -- e.g. 'lbs', 'miles', 'USD'
  target_date date,
  completed_at timestamptz,
  color text,
  created_at timestamptz not null default now()
);
create index goals_user_idx on goals (user_id, completed_at, target_date);

-- ─── Knowledge: notes ───────────────────────────────────────────────────
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  body text not null default '',
  tags text[] not null default '{}',
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notes_user_idx on notes (user_id, archived, pinned desc, updated_at desc);
create index notes_tags_idx on notes using gin (tags);

-- ─── Knowledge: journal entries ─────────────────────────────────────────
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  body text not null default '',
  mood smallint check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
create index journal_user_date_idx on journal_entries (user_id, date desc);

-- ─── Auto-update updated_at on row writes ───────────────────────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger notes_set_updated_at
before update on notes
for each row execute function set_updated_at();

create trigger journal_set_updated_at
before update on journal_entries
for each row execute function set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────
alter table categories       enable row level security;
alter table accounts         enable row level security;
alter table income           enable row level security;
alter table expenses         enable row level security;
alter table projects         enable row level security;
alter table tasks            enable row level security;
alter table habits           enable row level security;
alter table habit_entries    enable row level security;
alter table goals            enable row level security;
alter table notes            enable row level security;
alter table journal_entries  enable row level security;

create policy "categories owner"      on categories      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "accounts owner"        on accounts        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "income owner"          on income          for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "expenses owner"        on expenses        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "projects owner"        on projects        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks owner"           on tasks           for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "habits owner"          on habits          for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "habit_entries owner"   on habit_entries   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals owner"           on goals           for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes owner"           on notes           for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "journal_entries owner" on journal_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
