import { Banknote, Building2, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { listPlaidItems } from "@/lib/db/plaid";
import { isPlaidConfigured } from "@/lib/plaid";
import { listTellerEnrollments } from "@/lib/db/teller";
import { getTellerPublicConfig, isTellerConfigured } from "@/lib/teller";
import { PlaidLinkLauncher } from "./PlaidLinkLauncher";
import { ItemActions } from "./ItemActions";
import { TellerConnectLauncher } from "./TellerConnectLauncher";
import { TellerItemActions } from "./TellerItemActions";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const [plaidConfigured, tellerConfigured] = await Promise.all([
    isPlaidConfigured(),
    isTellerConfigured(),
  ]);
  const plaidItems = plaidConfigured ? await listPlaidItems().catch(() => []) : [];
  const tellerEnrollments = tellerConfigured
    ? await listTellerEnrollments().catch(() => [])
    : [];
  const tellerPublic = tellerConfigured ? await getTellerPublicConfig() : null;

  const noProviderConfigured = !plaidConfigured && !tellerConfigured;

  return (
    <>
      <PageHeader
        title="Connections"
        description="Auto-import transactions from your bank."
        section="connections"
        icon={Banknote}
      />

      {noProviderConfigured && (
        <Card className="border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800">
              <KeyRound className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-amber-900">No bank provider configured</p>
              <p className="mt-1 text-amber-800">
                Add credentials in{" "}
                <a className="font-semibold underline" href="/settings">
                  Settings
                </a>{" "}
                to enable bank connections. Daybook supports two aggregators:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800">
                <li>
                  <strong>Plaid</strong> — sandbox creds at{" "}
                  <a
                    className="underline"
                    href="https://dashboard.plaid.com/team/keys"
                    target="_blank"
                    rel="noreferrer"
                  >
                    dashboard.plaid.com
                  </a>
                  . Production access is gated by business onboarding.
                </li>
                <li>
                  <strong>Teller</strong> — uses mTLS client certificates. Free dev tier with up to
                  100 accounts. Sign up at{" "}
                  <a
                    className="underline"
                    href="https://teller.io"
                    target="_blank"
                    rel="noreferrer"
                  >
                    teller.io
                  </a>
                  .
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* ── Plaid ─────────────────────────────────────────── */}
      {plaidConfigured && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Plaid</p>
              <p className="text-xs text-slate-500">
                Connect a bank via Plaid Link. Daybook will import transactions and balances.
              </p>
            </div>
            <PlaidLinkLauncher />
          </div>
        </Card>
      )}

      {plaidConfigured && plaidItems.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">No Plaid banks connected yet.</p>
        </Card>
      )}

      {plaidItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {plaidItems.map((it) => (
            <Card key={it.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 text-white">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {it.institution_name ?? "Bank"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Plaid ·{" "}
                      {it.last_synced_at
                        ? `synced ${format(new Date(it.last_synced_at), "MMM d, h:mm a")}`
                        : "not synced yet"}
                    </p>
                  </div>
                </div>
                <ItemActions id={it.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Teller ────────────────────────────────────────── */}
      {tellerConfigured && tellerPublic && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Teller</p>
              <p className="text-xs text-slate-500">
                Connect a bank via Teller Connect. Free dev tier, US banks, mTLS-secured.
              </p>
            </div>
            <TellerConnectLauncher
              applicationId={tellerPublic.applicationId}
              environment={tellerPublic.env}
            />
          </div>
        </Card>
      )}

      {tellerConfigured && tellerEnrollments.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">No Teller banks connected yet.</p>
        </Card>
      )}

      {tellerEnrollments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {tellerEnrollments.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {e.institution_name ?? "Bank"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Teller ·{" "}
                      {e.last_synced_at
                        ? `synced ${format(new Date(e.last_synced_at), "MMM d, h:mm a")}`
                        : "not synced yet"}
                    </p>
                  </div>
                </div>
                <TellerItemActions id={e.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
