// ─── Money ───────────────────────────────────────────────────────────────

export type CategoryKind = "income" | "expense";

export type Category = {
  id: string;
  user_id: string;
  kind: CategoryKind;
  name: string;
  color: string | null;
  icon: string | null;
  sort_order: number;
  archived: boolean;
  created_at: string;
};

export type AccountKind =
  | "checking"
  | "savings"
  | "credit_card"
  | "cash"
  | "investment"
  | "loan"
  | "other";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  kind: AccountKind;
  balance_cents: number;
  currency: string;
  archived: boolean;
  created_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  date: string;
  source: string;
  amount_cents: number;
  category_id: string | null;
  account_id: string | null;
  notes: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  date: string;
  vendor: string;
  amount_cents: number;
  category_id: string | null;
  account_id: string | null;
  notes: string | null;
  created_at: string;
};

export type IncomeWithRefs = Income & {
  category: Pick<Category, "id" | "name" | "color"> | null;
  account: Pick<Account, "id" | "name"> | null;
};

export type ExpenseWithRefs = Expense & {
  category: Pick<Category, "id" | "name" | "color"> | null;
  account: Pick<Account, "id" | "name"> | null;
};

// ─── Productivity ────────────────────────────────────────────────────────

export type Project = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  archived: boolean;
  sort_order: number;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  notes: string | null;
  due_at: string | null;
  completed_at: string | null;
  priority: 0 | 1 | 2 | 3;
  sort_order: number;
  created_at: string;
};

export type TaskWithProject = Task & {
  project: Pick<Project, "id" | "name" | "color"> | null;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  frequency: "daily" | "weekly";
  target_per_period: number;
  color: string | null;
  icon: string | null;
  archived: boolean;
  created_at: string;
};

export type HabitEntry = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  count: number;
  created_at: string;
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
  name: string;
  kind: "income" | "expense";
  amount_cents: number;
  category_id: string | null;
  account_id: string | null;
  frequency: "weekly" | "monthly" | "yearly";
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  next_run_date: string;
  last_run_date: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
};

export type RecurringWithRefs = RecurringTransaction & {
  category: Pick<Category, "id" | "name" | "color"> | null;
  account: Pick<Account, "id" | "name"> | null;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  kind: "milestone" | "numeric";
  target_value: number | null;
  current_value: number;
  unit: string | null;
  target_date: string | null;
  completed_at: string | null;
  color: string | null;
  created_at: string;
};

// ─── Knowledge ───────────────────────────────────────────────────────────

export type Note = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  date: string;
  body: string;
  mood: number | null;
  created_at: string;
  updated_at: string;
};

// ─── System ──────────────────────────────────────────────────────────────

export type PlaidEnvName = "sandbox" | "development" | "production";
export type TellerEnvName = "sandbox" | "development" | "production";

export type AppSettings = {
  user_id: string;
  plaid_client_id: string | null;
  plaid_secret: string | null;
  plaid_env: PlaidEnvName;
  cron_secret: string | null;
  teller_application_id: string | null;
  teller_certificate: string | null;
  teller_private_key: string | null;
  teller_signing_secret: string | null;
  teller_env: TellerEnvName;
  updated_at: string;
};
