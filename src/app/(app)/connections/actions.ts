"use server";

import { revalidatePath } from "next/cache";
import { deleteTellerEnrollment } from "@/lib/db/teller";

export async function deleteTellerEnrollmentAction(id: string): Promise<void> {
  await deleteTellerEnrollment(id);
  revalidatePath("/connections");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}
