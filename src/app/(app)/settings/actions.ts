"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/schemas";
import { upsertMyAppSettings } from "@/lib/db/settings";

type FormState = { error: string | null; ok: boolean };

export async function saveSettingsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = settingsSchema.safeParse({
    plaid_client_id: formData.get("plaid_client_id") ?? "",
    plaid_secret: formData.get("plaid_secret") ?? "",
    plaid_env: formData.get("plaid_env") ?? "sandbox",
    cron_secret: formData.get("cron_secret") ?? "",
    teller_application_id: formData.get("teller_application_id") ?? "",
    teller_certificate: formData.get("teller_certificate") ?? "",
    teller_private_key: formData.get("teller_private_key") ?? "",
    teller_signing_secret: formData.get("teller_signing_secret") ?? "",
    teller_env: formData.get("teller_env") ?? "sandbox",
    clear_plaid_client_id: formData.get("clear_plaid_client_id") ?? "",
    clear_plaid_secret: formData.get("clear_plaid_secret") ?? "",
    clear_cron_secret: formData.get("clear_cron_secret") ?? "",
    clear_teller_application_id: formData.get("clear_teller_application_id") ?? "",
    clear_teller_certificate: formData.get("clear_teller_certificate") ?? "",
    clear_teller_private_key: formData.get("clear_teller_private_key") ?? "",
    clear_teller_signing_secret: formData.get("clear_teller_signing_secret") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", ok: false };
  }

  const v = parsed.data;
  // Empty string = leave existing value untouched (undefined). "1" in the
  // matching `clear_*` field = explicit null (delete the value).
  const resolve = (val: string, clear: string | undefined): string | null | undefined => {
    if (clear === "1") return null;
    return val.trim() === "" ? undefined : val.trim();
  };
  // PEM blobs preserve whitespace — only strip if the *whole thing* is blank.
  const resolvePem = (val: string, clear: string | undefined): string | null | undefined => {
    if (clear === "1") return null;
    return val.trim() === "" ? undefined : val;
  };

  try {
    await upsertMyAppSettings({
      plaid_client_id: resolve(v.plaid_client_id, v.clear_plaid_client_id),
      plaid_secret: resolve(v.plaid_secret, v.clear_plaid_secret),
      plaid_env: v.plaid_env,
      cron_secret: resolve(v.cron_secret, v.clear_cron_secret),
      teller_application_id: resolve(v.teller_application_id, v.clear_teller_application_id),
      teller_certificate: resolvePem(v.teller_certificate, v.clear_teller_certificate),
      teller_private_key: resolvePem(v.teller_private_key, v.clear_teller_private_key),
      teller_signing_secret: resolve(v.teller_signing_secret, v.clear_teller_signing_secret),
      teller_env: v.teller_env,
    });
  } catch (e) {
    return { error: (e as Error).message, ok: false };
  }
  revalidatePath("/settings");
  revalidatePath("/connections");
  return { error: null, ok: true };
}
