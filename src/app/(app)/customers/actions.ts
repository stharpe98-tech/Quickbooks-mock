"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customerSchema } from "@/lib/schemas";
import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/db/customers";

type FormState = { error: string | null };

export async function createCustomerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await createCustomer(parsed.data);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomerAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await updateCustomer(id, parsed.data);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomerAction(id: string): Promise<void> {
  await deleteCustomer(id);
  revalidatePath("/customers");
  redirect("/customers");
}
