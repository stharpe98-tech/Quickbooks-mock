import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Section } from "@/lib/theme";
import { accents } from "@/lib/theme";

export function PageHeader({
  title,
  description,
  actions,
  section,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  section?: Section;
  icon?: LucideIcon;
}) {
  const accent = section ? accents[section] : null;
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        {Icon && accent && (
          <span
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
              accent.gradient,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
