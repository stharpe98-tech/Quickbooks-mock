-- Address Supabase security advisor warnings:
--   * function_search_path_mutable        on set_updated_at, recompute_invoice_total
--   * anon_security_definer_function_executable on rls_auto_enable
--   * authenticated_security_definer_function_executable on rls_auto_enable

-- recompute_invoice_total references invoices/invoice_line_items, which were
-- dropped in 0002_life_os.sql. The trigger is dead code; drop it.
drop function if exists public.recompute_invoice_total() cascade;

-- Pin the search_path on the shared updated_at trigger function so its body
-- can't be re-routed via a malicious schema in a caller's path.
alter function public.set_updated_at() set search_path = '';

-- rls_auto_enable is invoked only by Postgres event triggers on CREATE TABLE.
-- Anonymous and signed-in users must not be able to call it via PostgREST.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
