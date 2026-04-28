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

// ─── Goals ───────────────────────────────────────────────────────────────

export const goalSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  description: optionalText(1000),
  kind: z.enum(["milestone", "numeric"]).default("milestone"),
  target_value: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined))
    .refine((v) => v === undefined || /^\d+(\.\d{1,2})?$/.test(v), { message: "Invalid target" }),
  unit: optionalText(20),
  target_date: isoDate.optional().or(z.literal("").transform(() => undefined)),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const goalProgressSchema = z.object({
  current_value: z
    .string()
    .min(1, "Required")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), { message: "Invalid value" }),
});

// ─── Notes ───────────────────────────────────────────────────────────────

export const noteSchema = z.object({
  title: optionalText(200),
  body: z.string().max(50_000).default(""),
  tags: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type NoteInput = z.infer<typeof noteSchema>;

// ─── Journal ─────────────────────────────────────────────────────────────

export const journalSchema = z.object({
  date: isoDate,
  body: z.string().max(50_000).default(""),
  mood: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || /^[1-5]$/.test(v), { message: "Invalid mood" }),
});
export type JournalInput = z.infer<typeof journalSchema>;

// ─── Recurring ───────────────────────────────────────────────────────────

// ─── System / Settings ───────────────────────────────────────────────────

// Distinguishes "leave untouched" (empty string) from "explicit clear"
// (a special sentinel sent by the form's "Clear" link). For the Plaid env
// dropdown we always submit the chosen value.
export const settingsSchema = z.object({
  plaid_client_id: z.string().max(200).optional().default(""),
  plaid_secret: z.string().max(200).optional().default(""),
  plaid_env: z.enum(["sandbox", "development", "production"]).default("sandbox"),
  cron_secret: z.string().max(200).optional().default(""),
  // Hidden inputs the form sets when the user clicks a "Clear" link.
  clear_plaid_client_id: z.string().optional(),
  clear_plaid_secret: z.string().optional(),
  clear_cron_secret: z.string().optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const recurringSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  kind: z.enum(["income", "expense"]),
  amount: moneyString,
  category_id: optionalUuid,
  account_id: optionalUuid,
  frequency: z.enum(["weekly", "monthly", "yearly"]),
  day_of_month: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined))
    .refine((v) => v === undefined || /^([1-9]|[12][0-9]|3[01])$/.test(v), {
      message: "Day of month 1-31",
    }),
  day_of_week: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined))
    .refine((v) => v === undefined || /^[0-6]$/.test(v), {
      message: "Day of week 0-6",
    }),
  start_date: isoDate,
  notes: optionalText(500),
});
export type RecurringInput = z.infer<typeof recurringSchema>;
