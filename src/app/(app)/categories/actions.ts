"use server";

import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/schemas";
import { createCategory, deleteCategory, seedDefaultCategories } from "@/lib/db/categories";

type FormState = { error: string | null };

export async function createCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = categorySchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    color: formData.get("color"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await createCategory(parsed.data);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/categories");
  return { error: null };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await deleteCategory(id);
  revalidatePath("/categories");
}

export async function seedDefaultCategoriesAction(): Promise<{ created: number }> {
  const result = await seedDefaultCategories();
  revalidatePath("/categories");
  return result;
}
