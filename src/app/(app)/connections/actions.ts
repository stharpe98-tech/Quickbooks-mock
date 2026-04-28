"use server";

import { revalidatePath } from "next/cache";
import { deletePlaidItem } from "@/lib/db/plaid";

export async function deleteConnectionAction(id: string): Promise<void> {
  await deletePlaidItem(id);
  revalidatePath("/connections");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}
