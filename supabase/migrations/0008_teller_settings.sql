-- Add Teller credentials to the per-user app_settings row. Same env-var-first,
-- DB-fallback pattern used by Plaid.

alter table app_settings
  add column if not exists teller_application_id text,
  add column if not exists teller_certificate    text,  -- PEM blob
  add column if not exists teller_private_key    text,  -- PEM blob
  add column if not exists teller_signing_secret text,  -- optional, for webhooks
  add column if not exists teller_env            text not null default 'sandbox'
    check (teller_env in ('sandbox', 'development', 'production'));
