-- Remove Plaid integration: schema columns, table, and associated indexes.
-- Teller is the sole bank aggregator going forward.

-- Drop the partial unique indexes that reference Plaid columns. Doing this
-- explicitly (rather than relying on the DROP COLUMN cascade) keeps the
-- migration readable.
drop index if exists public.accounts_plaid_account_idx;
drop index if exists public.income_plaid_tx_idx;
drop index if exists public.expenses_plaid_tx_idx;

-- accounts.plaid_item_id has an FK to plaid_items with ON DELETE SET NULL.
-- Dropping the table cascades the FK, but we want the columns gone too.
alter table public.accounts
  drop column if exists plaid_account_id,
  drop column if exists plaid_item_id;

alter table public.income   drop column if exists plaid_transaction_id;
alter table public.expenses drop column if exists plaid_transaction_id;

drop table if exists public.plaid_items cascade;

alter table public.app_settings
  drop column if exists plaid_client_id,
  drop column if exists plaid_secret,
  drop column if exists plaid_env;
