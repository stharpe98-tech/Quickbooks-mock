import { Banknote, Building2, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { listTellerEnrollments } from "@/lib/db/teller";
import { getTellerPublicConfig, isTellerConfigured } from "@/lib/teller";
import { TellerConnectLauncher } from "./TellerConnectLauncher";
import { TellerItemActions } from "./TellerItemActions";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const tellerConfigured = await isTellerConfigured();
  const tellerEnrollments = tellerConfigured
    ? await listTellerEnrollments().catch(() => [])
    : [];
  const tellerPublic = tellerConfigured ? await getTellerPublicConfig() : null;

  return (
    <>
      <PageHeader
        title="Connections"
        description="Auto-import transactions from your bank."
        section="connections"
        icon={Banknote}
      />

      {!tellerConfigured && (
        <Card className="border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800">
              <KeyRound className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Teller not configured</p>
              <p className="mt-1 text-amber-800">
                Add your Teller application ID + cert/key in{" "}
                <a className="font-semibold underline" href="/settings">
                  Settings
                </a>{" "}
                to enable bank connections. Teller offers a free dev tier for up to 100 accounts at{" "}
                <a
                  className="underline"
                  href="https://teller.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  teller.io
                </a>
                .
              </p>
            </div>
          </div>
        </Card>
      )}

      {tellerConfigured && tellerPublic && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Teller</p>
              <p className="text-xs text-slate-500">
                Connect a bank via Teller Connect. Transactions auto-categorize on import.
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
          <p className="text-sm text-slate-500">No banks connected yet.</p>
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
                      {e.last_synced_at
                        ? `Synced ${format(new Date(e.last_synced_at), "MMM d, h:mm a")}`
                        : "Not synced yet"}
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
