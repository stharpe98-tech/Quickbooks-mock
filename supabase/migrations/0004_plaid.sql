-- Plaid integration: store per-bank items + link Plaid IDs onto our rows.

create table plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Plaid access_token. Long-lived; treat as a secret. RLS keeps it owner-scoped.
  access_token text not null,
  item_id text not null unique,
  institution_id text,
  institution_name text,
  -- For incremental transactions/sync
  last_sync_cursor text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index plaid_items_user_idx on plaid_items (user_id, created_at desc);

alter table plaid_items enable row level security;
create policy "plaid_items owner" on plaid_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Link our accounts to Plaid accounts so balances + transactions can map back.
alter table accounts add column if not exists plaid_account_id text;
alter table accounts add column if not exists plaid_item_id uuid references plaid_items(id) on delete set null;
create unique index if not exists accounts_plaid_account_idx
  on accounts (user_id, plaid_account_id) where plaid_account_id is not null;

-- Dedup transactions on import (plaid transaction_id is stable across syncs).
alter table income   add column if not exists plaid_transaction_id text;
alter table expenses add column if not exists plaid_transaction_id text;
create unique index if not exists income_plaid_tx_idx
  on income (user_id, plaid_transaction_id) where plaid_transaction_id is not null;
create unique index if not exists expenses_plaid_tx_idx
  on expenses (user_id, plaid_transaction_id) where plaid_transaction_id is not null;
