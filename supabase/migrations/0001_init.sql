-- QuickBooks Mock — initial schema.
-- All tables are scoped to the authenticated user via RLS (user_id = auth.uid()).
-- Money is stored as bigint cents. Never use float for currency.

create extension if not exists "pgcrypto";

-- ─── customers ────────────────────────────────────────────────────────────
create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
create index customers_user_created_idx on customers (user_id, created_at desc);

-- ─── invoices ─────────────────────────────────────────────────────────────
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  total_cents bigint not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index invoices_user_created_idx on invoices (user_id, created_at desc);
create index invoices_customer_idx on invoices (customer_id);

-- ─── invoice_line_items ───────────────────────────────────────────────────
create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price_cents bigint not null default 0,
  line_total_cents bigint not null
    generated always as ((quantity * unit_price_cents)::bigint) stored,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index line_items_invoice_idx on invoice_line_items (invoice_id, position);

-- Recompute parent invoice total whenever a line item changes.
create or replace function recompute_invoice_total() returns trigger
language plpgsql as $$
declare
  target_invoice uuid;
begin
  target_invoice := coalesce(new.invoice_id, old.invoice_id);
  update invoices
     set total_cents = coalesce(
       (select sum(line_total_cents) from invoice_line_items where invoice_id = target_invoice),
       0
     )
   where id = target_invoice;
  return null;
end $$;

create trigger line_items_recompute_total
after insert or update or delete on invoice_line_items
for each row execute function recompute_invoice_total();

-- ─── expenses ─────────────────────────────────────────────────────────────
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_date date not null default current_date,
  vendor text not null,
  amount_cents bigint not null default 0,
  category text,
  notes text,
  created_at timestamptz not null default now()
);
create index expenses_user_created_idx on expenses (user_id, created_at desc);
create index expenses_date_idx on expenses (user_id, expense_date desc);

-- ─── Row Level Security ───────────────────────────────────────────────────
alter table customers           enable row level security;
alter table invoices            enable row level security;
alter table invoice_line_items  enable row level security;
alter table expenses            enable row level security;

create policy "customers are owner-scoped" on customers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "invoices are owner-scoped" on invoices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "line_items are owner-scoped" on invoice_line_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "expenses are owner-scoped" on expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
