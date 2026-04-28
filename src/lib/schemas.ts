import { z } from "zod";

const moneyString = z
  .string()
  .min(1, "Required")
  .refine((v) => /^-?\d+(\.\d{1,2})?$/.test(v.replace(/[$,\s]/g, "")), {
    message: "Enter a valid amount (e.g. 12.34)",
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

const optionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal("").transform(() => undefined));

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date required");

// ─── Money ───────────────────────────────────────────────────────────────

export const incomeSchema = z.object({
  date: isoDate,
  source: z.string().trim().min(1, "Source is required").max(120),
  amount: moneyString,
  category_id: optionalUuid,
  account_id: optionalUuid,
  notes: optionalText(500),
});
export type IncomeInput = z.infer<typeof incomeSchema>;

export const expenseSchema = z.object({
  date: isoDate,
  vendor: z.string().trim().min(1, "Vendor is required").max(120),
  amount: moneyString,
  category_id: optionalUuid,
  account_id: optionalUuid,
  notes: optionalText(500),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const categorySchema = z.object({
  kind: z.enum(["income", "expense"]),
  name: z.string().trim().min(1, "Name required").max(60),
  color: optionalText(20),
  icon: optionalText(40),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(60),
  kind: z.enum([
    "checking",
    "savings",
    "credit_card",
    "cash",
    "investment",
    "loan",
    "other",
  ]),
  balance: moneyString,
  currency: z.string().length(3).default("USD"),
});
export type AccountInput = z.infer<typeof accountSchema>;

// ─── Productivity ────────────────────────────────────────────────────────

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200),
  notes: optionalText(1000),
  due_at: isoDate.optional().or(z.literal("").transform(() => undefined)),
  priority: z.coerce.number().int().min(0).max(3).default(0),
  project_id: optionalUuid,
});
export type TaskInput = z.infer<typeof taskSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  color: optionalText(20),
  icon: optionalText(40),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const habitSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
  target_per_period: z.coerce.number().int().min(1).max(99).default(1),
  color: optionalText(20),
  icon: optionalText(40),
});
export type HabitInput = z.infer<typeof habitSchema>;
