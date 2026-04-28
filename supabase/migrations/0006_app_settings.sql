-- App-level settings — one row per user. Stores credentials normally kept in
-- env vars (Plaid, cron secret) so they can be edited from the in-app
-- /settings page. Env vars still take precedence at read time; this is the
-- fallback. Plaintext is acceptable for a single-user personal app behind RLS.

create table app_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plaid_client_id text,
  plaid_secret text,
  plaid_env text not null default 'sandbox' check (plaid_env in ('sandbox','development','production')),
  cron_secret text,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

create policy "app_settings owner" on app_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger app_settings_set_updated_at
before update on app_settings
for each row execute function set_updated_at();
