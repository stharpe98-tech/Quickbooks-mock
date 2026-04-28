import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableElement> & { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table {...props} className={clsx("min-w-full divide-y divide-slate-200", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function TR({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { children: ReactNode }) {
  return (
    <tr {...props} className={clsx("hover:bg-slate-50", className)}>
      {children}
    </tr>
  );
}

export function TH({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th
      scope="col"
      {...props}
      className={clsx(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td {...props} className={clsx("whitespace-nowrap px-4 py-3 text-sm text-slate-700", className)}>
      {children}
    </td>
  );
}

export function EmptyState({
  title,
  hint,
  icon: Icon,
  gradient,
}: {
  title: string;
  hint?: string;
  icon?: LucideIcon;
  /** Optional Tailwind gradient classes for the icon tile. */
  gradient?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
      {Icon && (
        <span
          className={clsx(
            "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm",
            gradient ?? "bg-gradient-to-br from-slate-400 to-slate-600",
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
