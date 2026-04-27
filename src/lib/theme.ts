// Per-section accent palette. Reuse these tokens — never hard-code colors
// in pages. Tailwind needs the literal class strings somewhere it can scan,
// which is why we list each combination explicitly instead of templating.

export type Section = "dashboard" | "customers" | "invoices" | "expenses";

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
    solidBg: "bg-emerald-500",
    solidText: "text-white",
    softBg: "bg-emerald-50",
    softText: "text-emerald-700",
    gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
    ring: "ring-emerald-500",
    hex: "#10b981",
  },
  customers: {
    label: "Customers",
    solidBg: "bg-sky-500",
    solidText: "text-white",
    softBg: "bg-sky-50",
    softText: "text-sky-700",
    gradient: "bg-gradient-to-br from-sky-400 to-blue-600",
    ring: "ring-sky-500",
    hex: "#0ea5e9",
  },
  invoices: {
    label: "Invoices",
    solidBg: "bg-violet-500",
    solidText: "text-white",
    softBg: "bg-violet-50",
    softText: "text-violet-700",
    gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    ring: "ring-violet-500",
    hex: "#8b5cf6",
  },
  expenses: {
    label: "Expenses",
    solidBg: "bg-amber-500",
    solidText: "text-white",
    softBg: "bg-amber-50",
    softText: "text-amber-700",
    gradient: "bg-gradient-to-br from-amber-400 to-orange-600",
    ring: "ring-amber-500",
    hex: "#f59e0b",
  },
};

export const brandGradient =
  "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500";
export const brandGradientText =
  "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent";
