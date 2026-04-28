import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AppSettings, PlaidEnvName } from "./types";

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/** Settings for the currently signed-in user. Used by the /settings page. */
export async function getMyAppSettings(): Promise<AppSettings | null> {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb
    .from("app_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as AppSettings | null) ?? null;
}

/**
 * Single-user-app helper: returns the only app_settings row, no auth required.
 * Used by background paths (cron) and by Plaid helpers that don't have a user
 * context. Bypasses RLS via service-role.
 */
export async function getAnyAppSettings(): Promise<AppSettings | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }
  const sb = service();
  const { data, error } = await sb
    .from("app_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as AppSettings | null) ?? null;
}

export type AppSettingsInput = {
  // `null` clears the value, `undefined` leaves it unchanged.
  plaid_client_id?: string | null;
  plaid_secret?: string | null;
  plaid_env?: PlaidEnvName;
  cron_secret?: string | null;
};

export async function upsertMyAppSettings(input: AppSettingsInput): Promise<void> {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await getMyAppSettings();
  const merged = {
    user_id: user.id,
    plaid_client_id:
      input.plaid_client_id !== undefined
        ? input.plaid_client_id
        : (existing?.plaid_client_id ?? null),
    plaid_secret:
      input.plaid_secret !== undefined
        ? input.plaid_secret
        : (existing?.plaid_secret ?? null),
    plaid_env: input.plaid_env ?? existing?.plaid_env ?? "sandbox",
    cron_secret:
      input.cron_secret !== undefined
        ? input.cron_secret
        : (existing?.cron_secret ?? null),
  };

  const { error } = await sb
    .from("app_settings")
    .upsert(merged, { onConflict: "user_id" });
  if (error) throw error;
}

/** Mask a secret for safe display in the UI: keep last 4 chars, mask rest. */
export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return "•".repeat(value.length);
  return "•".repeat(Math.max(8, value.length - 4)) + value.slice(-4);
}
