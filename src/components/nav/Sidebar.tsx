"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, Users, FileText, Receipt, type LucideIcon } from "lucide-react";
import { accents, type Section } from "@/lib/theme";

type NavItem = {
  href: string;
  section: Section;
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { href: "/dashboard", section: "dashboard", icon: LayoutDashboard },
  { href: "/customers", section: "customers", icon: Users },
  { href: "/invoices", section: "invoices", icon: FileText },
  { href: "/expenses", section: "expenses", icon: Receipt },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const accent = accents[item.section];
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? clsx(accent.softBg, accent.softText, "shadow-sm")
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <span
              className={clsx(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                active
                  ? clsx(accent.gradient, "text-white shadow")
                  : "bg-slate-100 text-slate-500 group-hover:bg-white",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>{accent.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
