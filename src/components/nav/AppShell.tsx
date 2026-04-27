"use client";

import { useState } from "react";
import Link from "next/link";
import { SidebarNav } from "./Sidebar";

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
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-6 block px-3 py-1 text-lg font-semibold text-slate-900">
          QuickBooks Mock
        </Link>
        <SidebarNav />
        <div className="mt-auto border-t border-slate-200 pt-4">
          <p className="px-3 text-xs text-slate-500">Signed in as</p>
          <p className="px-3 truncate text-sm text-slate-700">{email}</p>
          <form action="/api/auth/signout" method="post" className="mt-2 px-1">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/dashboard" className="text-sm font-semibold text-slate-900">
          QuickBooks Mock
        </Link>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="text-xs font-medium text-slate-600">
            Sign out
          </button>
        </form>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-64 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/dashboard" onClick={close} className="text-lg font-semibold text-slate-900">
                QuickBooks Mock
              </Link>
              <button
                aria-label="Close menu"
                onClick={close}
                className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <SidebarNav onNavigate={close} />
            <p className="mt-6 px-3 text-xs text-slate-500">Signed in as</p>
            <p className="px-3 truncate text-sm text-slate-700">{email}</p>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
