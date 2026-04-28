// Per-section accent palette. Reuse these tokens — never hard-code colors
// in pages. Tailwind needs the literal class strings somewhere it can scan,
// which is why we list each combination explicitly instead of templating.

export type Section =
  | "dashboard"
  | "income"
  | "expenses"
  | "categories"
  | "accounts"
  | "recurring"
  | "reports"
  | "connections"
  | "tasks"
  | "habits"
  | "goals"
  | "notes"
  | "journal"
  | "settings";

type Accent = {
  label: string;
  // Solid background + readable foreground (for filled chips / icon tiles).
  solidBg: string;
  solidText: string;
  // Soft tinted background (for hover, badge-y backgrounds).
  softBg: string;
  softText: string;
  // Gradient for stat cards / hero strips.
  gradient: string;
  // Ring color for active nav highlight.
  ring: string;
  // Hex (used by inline SVG / shadow rgba — kept simple).
  hex: string;
};

export const accents: Record<Section, Accent> = {
  dashboard: {
    label: "Dashboard",
    solidBg: "bg-indigo-500",
    solidText: "text-white",
    softBg: "bg-indigo-50",
    softText: "text-indigo-700",
    gradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
    ring: "ring-indigo-500",
    hex: "#6366f1",
  },
  income: {
    label: "Income",
    solidBg: "bg-emerald-500",
    solidText: "text-white",
    softBg: "bg-emerald-50",
    softText: "text-emerald-700",
    gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
    ring: "ring-emerald-500",
    hex: "#10b981",
  },
  expenses: {
    label: "Expenses",
    solidBg: "bg-rose-500",
    solidText: "text-white",
    softBg: "bg-rose-50",
    softText: "text-rose-700",
    gradient: "bg-gradient-to-br from-rose-400 to-rose-600",
    ring: "ring-rose-500",
    hex: "#f43f5e",
  },
  categories: {
    label: "Categories",
    solidBg: "bg-slate-500",
    solidText: "text-white",
    softBg: "bg-slate-100",
    softText: "text-slate-700",
    gradient: "bg-gradient-to-br from-slate-400 to-slate-600",
    ring: "ring-slate-500",
    hex: "#64748b",
  },
  accounts: {
    label: "Accounts",
    solidBg: "bg-sky-500",
    solidText: "text-white",
    softBg: "bg-sky-50",
    softText: "text-sky-700",
    gradient: "bg-gradient-to-br from-sky-400 to-blue-600",
    ring: "ring-sky-500",
    hex: "#0ea5e9",
  },
  recurring: {
    label: "Recurring",
    solidBg: "bg-fuchsia-500",
    solidText: "text-white",
    softBg: "bg-fuchsia-50",
    softText: "text-fuchsia-700",
    gradient: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
    ring: "ring-fuchsia-500",
    hex: "#d946ef",
  },
  reports: {
    label: "Reports",
    solidBg: "bg-blue-500",
    solidText: "text-white",
    softBg: "bg-blue-50",
    softText: "text-blue-700",
    gradient: "bg-gradient-to-br from-blue-400 to-indigo-600",
    ring: "ring-blue-500",
    hex: "#3b82f6",
  },
  connections: {
    label: "Connections",
    solidBg: "bg-green-500",
    solidText: "text-white",
    softBg: "bg-green-50",
    softText: "text-green-700",
    gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
    ring: "ring-green-500",
    hex: "#22c55e",
  },
  tasks: {
    label: "Tasks",
    solidBg: "bg-violet-500",
    solidText: "text-white",
    softBg: "bg-violet-50",
    softText: "text-violet-700",
    gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    ring: "ring-violet-500",
    hex: "#8b5cf6",
  },
  habits: {
    label: "Habits",
    solidBg: "bg-amber-500",
    solidText: "text-white",
    softBg: "bg-amber-50",
    softText: "text-amber-700",
    gradient: "bg-gradient-to-br from-amber-400 to-orange-600",
    ring: "ring-amber-500",
    hex: "#f59e0b",
  },
  goals: {
    label: "Goals",
    solidBg: "bg-pink-500",
    solidText: "text-white",
    softBg: "bg-pink-50",
    softText: "text-pink-700",
    gradient: "bg-gradient-to-br from-pink-400 to-rose-600",
    ring: "ring-pink-500",
    hex: "#ec4899",
  },
  notes: {
    label: "Notes",
    solidBg: "bg-cyan-500",
    solidText: "text-white",
    softBg: "bg-cyan-50",
    softText: "text-cyan-700",
    gradient: "bg-gradient-to-br from-cyan-400 to-sky-600",
    ring: "ring-cyan-500",
    hex: "#06b6d4",
  },
  journal: {
    label: "Journal",
    solidBg: "bg-teal-500",
    solidText: "text-white",
    softBg: "bg-teal-50",
    softText: "text-teal-700",
    gradient: "bg-gradient-to-br from-teal-400 to-emerald-600",
    ring: "ring-teal-500",
    hex: "#14b8a6",
  },
  settings: {
    label: "Settings",
    solidBg: "bg-zinc-600",
    solidText: "text-white",
    softBg: "bg-zinc-100",
    softText: "text-zinc-700",
    gradient: "bg-gradient-to-br from-zinc-500 to-slate-700",
    ring: "ring-zinc-500",
    hex: "#52525b",
  },
};

export const brandGradient =
  "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500";
export const brandGradientText =
  "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent";
export const brandName = "Daybook";
