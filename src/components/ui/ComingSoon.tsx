import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { Section } from "@/lib/theme";
import { accents } from "@/lib/theme";
import { PageHeader } from "./PageHeader";

export function ComingSoon({
  title,
  description,
  section,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  section: Section;
  icon: LucideIcon;
  features: string[];
}) {
  const accent = accents[section];
  return (
    <>
      <PageHeader title={title} description={description} section={section} icon={Icon} />
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center sm:p-14">
        <span
          className={clsx(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md",
            accent.gradient,
          )}
        >
          <Icon className="h-8 w-8" />
        </span>
        <h2 className="text-xl font-semibold text-slate-900">Coming next</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          The data is stored, the section is wired up &mdash; the screens are next.
          Here is what is planned:
        </p>
        <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-slate-700">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span
                className={clsx("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", accent.solidBg)}
                aria-hidden
              />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
