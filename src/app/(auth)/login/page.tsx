import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { brandGradient, brandGradientText } from "@/lib/theme";

export const metadata: Metadata = { title: "Sign in — QuickBooks Mock" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Decorative blurred blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-300 opacity-40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-300 opacity-40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300 opacity-30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${brandGradient} text-white shadow-lg`}
          >
            <Wallet className="h-7 w-7" />
          </span>
          <h1 className={`text-3xl font-bold tracking-tight ${brandGradientText}`}>
            QuickBooks Mock
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with a magic link to your inbox.
          </p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Bookkeeping that follows you everywhere.
        </p>
      </div>
    </div>
  );
}
