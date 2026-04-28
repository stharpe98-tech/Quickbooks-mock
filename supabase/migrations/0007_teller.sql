-- Teller integration: store per-bank enrollments + link Teller IDs onto our rows.
-- Mirrors the shape of the Plaid integration so both can coexist.

create table teller_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Teller access token. Long-lived; treat as a secret. RLS keeps it owner-scoped.
  access_token text not null,
  -- Teller's enrollment id (e.g. enr_xxx). One per linked bank login.
  enrollment_id text not null,
  institution_id text,
  institution_name text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, enrollment_id)
);

create index teller_enrollments_user_idx on teller_enrollments (user_id, created_at desc);

alter table teller_enrollments enable row level security;
create policy "teller_enrollments owner" on teller_enrollments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Link our accounts to Teller accounts so balances + transactions can map back.
alter table accounts add column if not exists teller_account_id text;
alter table accounts add column if not exists teller_enrollment_id uuid references teller_enrollments(id) on delete set null;
create unique index if not exists accounts_teller_account_idx
  on accounts (user_id, teller_account_id) where teller_account_id is not null;

-- Dedup transactions on import (teller transaction id is stable across syncs).
alter table income   add column if not exists teller_transaction_id text;
alter table expenses add column if not exists teller_transaction_id text;
create unique index if not exists income_teller_tx_idx
  on income (user_id, teller_transaction_id) where teller_transaction_id is not null;
create unique index if not exists expenses_teller_tx_idx
  on expenses (user_id, teller_transaction_id) where teller_transaction_id is not null;
