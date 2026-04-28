"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  BarChart3,
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  ListChecks,
  RefreshCw,
  StickyNote,
  Tags,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { accents, type Section } from "@/lib/theme";

type NavItem = {
  href: string;
  section: Section;
  icon: LucideIcon;
  /** Optional label override (defaults to section label). */
  label?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", section: "dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Money",
    items: [
      { href: "/income", section: "income", icon: ArrowUpCircle },
      { href: "/expenses", section: "expenses", icon: ArrowDownCircle },
      { href: "/recurring", section: "recurring", icon: RefreshCw },
      { href: "/categories", section: "categories", icon: Tags },
      { href: "/accounts", section: "accounts", icon: Wallet },
      { href: "/connections", section: "connections", icon: Banknote },
      { href: "/reports", section: "reports", icon: BarChart3 },
    ],
  },
  {
    title: "Productivity",
    items: [
      { href: "/tasks", section: "tasks", icon: CheckSquare },
      { href: "/habits", section: "habits", icon: ListChecks },
      { href: "/goals", section: "goals", icon: Target },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { href: "/notes", section: "notes", icon: StickyNote },
      { href: "/journal", section: "journal", icon: BookOpen },
    ],
  },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {group.title}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const accent = accents[item.section];
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={clsx(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? clsx(accent.softBg, accent.softText, "shadow-sm")
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                      active
                        ? clsx(accent.gradient, "text-white shadow")
                        : "bg-slate-100 text-slate-500 group-hover:bg-white",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{item.label ?? accent.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

