"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Wallet, X } from "lucide-react";
import { SidebarNav } from "./Sidebar";
import { brandGradient, brandGradientText } from "@/lib/theme";

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${brandGradient} text-white shadow-md`}
      >
        <Wallet className="h-5 w-5" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${brandGradientText}`}>
        QuickBooks Mock
      </span>
    </Link>
  );
}

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="mb-6 px-2 pt-1">
          <BrandMark />
        </div>
        <SidebarNav />
        <div className="mt-auto space-y-1 border-t border-slate-200 pt-4">
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Signed in
          </p>
          <p className="truncate px-3 text-sm text-slate-700">{email}</p>
          <form action="/api/auth/signout" method="post" className="pt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandMark />
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Sign out"
            className="rounded-md p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-4 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <BrandMark />
              <button
                aria-label="Close menu"
                onClick={close}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={close} />
            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                Signed in
              </p>
              <p className="truncate px-3 text-sm text-slate-700">{email}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
