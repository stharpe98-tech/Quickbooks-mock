"use server";

import { revalidatePath } from "next/cache";
import { deletePlaidItem } from "@/lib/db/plaid";
import { deleteTellerEnrollment } from "@/lib/db/teller";

export async function deleteConnectionAction(id: string): Promise<void> {
  await deletePlaidItem(id);
  revalidatePath("/connections");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function deleteTellerEnrollmentAction(id: string): Promise<void> {
  await deleteTellerEnrollment(id);
  revalidatePath("/connections");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}
