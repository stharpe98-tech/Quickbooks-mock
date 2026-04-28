"use server";

import { revalidatePath } from "next/cache";
import { accountSchema } from "@/lib/schemas";
import { parseDollars } from "@/lib/money";
import { createAccount, deleteAccount } from "@/lib/db/accounts";

type FormState = { error: string | null };

export async function createAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    balance: formData.get("balance"),
    currency: formData.get("currency") || "USD",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const cents = parseDollars(parsed.data.balance);
  if (cents === null) return { error: "Invalid balance" };

  try {
    await createAccount({
      name: parsed.data.name,
      kind: parsed.data.kind,
      balance_cents: cents,
      currency: parsed.data.currency,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteAccountAction(id: string): Promise<void> {
  await deleteAccount(id);
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}
