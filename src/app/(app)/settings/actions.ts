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
    clear_plaid_client_id: formData.get("clear_plaid_client_id") ?? "",
    clear_plaid_secret: formData.get("clear_plaid_secret") ?? "",
    clear_cron_secret: formData.get("clear_cron_secret") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", ok: false };
  }

  // For each text field: empty string = leave existing untouched (undefined).
  // "1" in the matching `clear_*` field = explicit null (delete the value).
  const v = parsed.data;
  const resolve = (val: string, clear: string | undefined): string | null | undefined => {
    if (clear === "1") return null;
    return val.trim() === "" ? undefined : val.trim();
  };

  try {
    await upsertMyAppSettings({
      plaid_client_id: resolve(v.plaid_client_id, v.clear_plaid_client_id),
      plaid_secret: resolve(v.plaid_secret, v.clear_plaid_secret),
      plaid_env: v.plaid_env,
      cron_secret: resolve(v.cron_secret, v.clear_cron_secret),
    });
  } catch (e) {
    return { error: (e as Error).message, ok: false };
  }
  revalidatePath("/settings");
  revalidatePath("/connections");
  return { error: null, ok: true };
}
