import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AppSettings, TellerEnvName } from "./types";

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
 * Used by background paths (cron) and by Teller helpers that don't have a user
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
  cron_secret?: string | null;
  teller_application_id?: string | null;
  teller_certificate?: string | null;
  teller_private_key?: string | null;
  teller_signing_secret?: string | null;
  teller_env?: TellerEnvName;
};

export async function upsertMyAppSettings(input: AppSettingsInput): Promise<void> {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await getMyAppSettings();
  const keep = <T,>(next: T | undefined, prev: T | null | undefined): T | null =>
    next !== undefined ? next : ((prev as T | null) ?? null);

  const merged = {
    user_id: user.id,
    cron_secret: keep(input.cron_secret, existing?.cron_secret),
    teller_application_id: keep(input.teller_application_id, existing?.teller_application_id),
    teller_certificate: keep(input.teller_certificate, existing?.teller_certificate),
    teller_private_key: keep(input.teller_private_key, existing?.teller_private_key),
    teller_signing_secret: keep(input.teller_signing_secret, existing?.teller_signing_secret),
    teller_env: input.teller_env ?? existing?.teller_env ?? "sandbox",
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
