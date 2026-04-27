import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md hover:shadow-lg hover:brightness-110 focus-visible:ring-violet-500",
  secondary:
    "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-indigo-500",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-indigo-500",
  danger:
    "bg-rose-600 text-white shadow-md hover:bg-rose-700 focus-visible:ring-rose-500",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button {...props} className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </button>
  );
}
