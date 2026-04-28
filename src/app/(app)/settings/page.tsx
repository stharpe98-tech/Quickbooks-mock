import {
  CheckCircle2,
  Database,
  Globe,
  KeyRound,
  Settings as SettingsIcon,
  ShieldAlert,
  Timer,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyAppSettings, maskSecret } from "@/lib/db/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

type EnvStatus = {
  name: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const SUPABASE_ENV_VARS: EnvStatus[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase URL",
    description: "Inlined into the client bundle at build time. Must be an env var.",
    icon: Database,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Supabase anon key",
    description: "Inlined into the client bundle. Must be an env var.",
    icon: KeyRound,
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role key",
    description: "Server-only. Required for cron + bootstrap. Must be an env var.",
    icon: ShieldAlert,
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    label: "Site URL",
    description: "Used by magic-link auth redirects.",
    icon: Globe,
  },
];

export default async function SettingsPage() {
  const settings = await getMyAppSettings();
  const plaidEnvVarSet = Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
  const cronEnvVarSet = Boolean(process.env.CRON_SECRET);
  const tellerEnvVarSet = Boolean(
    process.env.TELLER_APPLICATION_ID &&
      process.env.TELLER_CERTIFICATE &&
      process.env.TELLER_PRIVATE_KEY,
  );

  const envStatuses = SUPABASE_ENV_VARS.map((v) => ({
    ...v,
    value: process.env[v.name],
  }));

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage credentials and integrations from one place."
        section="settings"
        icon={SettingsIcon}
      />

      <SettingsForm
        initial={{
          plaid_client_id: settings?.plaid_client_id ?? null,
          plaid_secret: settings?.plaid_secret ?? null,
          plaid_env: settings?.plaid_env ?? "sandbox",
          cron_secret: settings?.cron_secret ?? null,
          teller_application_id: settings?.teller_application_id ?? null,
          teller_env: settings?.teller_env ?? "sandbox",
        }}
        masks={{
          plaid_client_id: settings?.plaid_client_id ?? null,
          plaid_secret: maskSecret(settings?.plaid_secret),
          cron_secret: maskSecret(settings?.cron_secret),
          teller_application_id: settings?.teller_application_id ?? null,
          teller_certificate: settings?.teller_certificate ? "PEM (saved)" : null,
          teller_private_key: settings?.teller_private_key ? "PEM (saved)" : null,
          teller_signing_secret: maskSecret(settings?.teller_signing_secret),
        }}
        envOverrides={{
          plaid: plaidEnvVarSet,
          cron: cronEnvVarSet,
          teller: tellerEnvVarSet,
        }}
      />

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-500 to-slate-700 text-white">
            <Database className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Supabase environment</p>
            <p className="text-xs text-slate-500">
              These keys must be set as environment variables — they&apos;re needed before the
              database is reachable, so they can&apos;t be edited here.
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {envStatuses.map((s) => {
            const Icon = s.icon;
            const present = Boolean(s.value);
            return (
              <li key={s.name} className="flex items-start gap-3 px-4 py-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{s.label}</p>
                    {present ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                        <XCircle className="h-3 w-3" />
                        Missing
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
                  <p className="mt-1 text-xs">
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">
                      {s.name}
                    </code>
                    {present && (
                      <span className="ml-2 font-mono text-[11px] text-slate-500">
                        {maskSecret(s.value) ?? s.value}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 text-xs text-slate-500">
          Set these in <code className="rounded bg-slate-100 px-1">.env.local</code> for local dev,
          and in your Vercel project&apos;s Environment Variables for production.
        </p>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white">
            <Timer className="h-5 w-5" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-slate-900">About the keys above</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>
                Environment variables always win. If a key is set in the env, the value below is
                ignored — handy for staging vs. local.
              </li>
              <li>Secrets are stored in your own Supabase database, protected by RLS.</li>
              <li>Leave a field blank to keep the existing value. Use &ldquo;Clear&rdquo; to remove it.</li>
              <li>
                For Plaid sandbox creds, sign up at{" "}
                <a
                  className="underline"
                  href="https://dashboard.plaid.com/team/keys"
                  target="_blank"
                  rel="noreferrer"
                >
                  dashboard.plaid.com
                </a>
                .
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}
