-- Recurring transactions (subscriptions, bills, recurring paychecks).
-- A daily cron job creates regular income/expense entries when next_run_date <= today.

create table recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  amount_cents bigint not null default 0,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  -- For monthly: 1-31. For yearly: ignored (use start_date's day). For weekly: ignored.
  day_of_month smallint check (day_of_month is null or (day_of_month between 1 and 31)),
  -- For weekly: 0=Sunday … 6=Saturday. Otherwise ignored.
  day_of_week smallint check (day_of_week is null or (day_of_week between 0 and 6)),
  start_date date not null default current_date,
  next_run_date date not null,
  last_run_date date,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index recurring_user_idx on recurring_transactions (user_id, active, next_run_date);
create index recurring_due_idx on recurring_transactions (next_run_date) where active = true;

alter table recurring_transactions enable row level security;
create policy "recurring owner" on recurring_transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
