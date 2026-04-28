import { Banknote, Building2, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { listPlaidItems } from "@/lib/db/plaid";
import { isPlaidConfigured } from "@/lib/plaid";
import { PlaidLinkLauncher } from "./PlaidLinkLauncher";
import { ItemActions } from "./ItemActions";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const configured = isPlaidConfigured();
  const items = configured ? await listPlaidItems().catch(() => []) : [];

  return (
    <>
      <PageHeader
        title="Connections"
        description="Auto-import transactions from your bank via Plaid."
        section="connections"
        icon={Banknote}
      />

      {!configured && (
        <Card className="border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800">
              <KeyRound className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Plaid not configured</p>
              <p className="mt-1 text-amber-800">
                To enable bank connections, set <code className="rounded bg-amber-100 px-1">PLAID_CLIENT_ID</code> and{" "}
                <code className="rounded bg-amber-100 px-1">PLAID_SECRET</code> in your Vercel project&apos;s environment variables. Optionally set{" "}
                <code className="rounded bg-amber-100 px-1">PLAID_ENV</code> to <code>sandbox</code> (default), <code>development</code>, or <code>production</code>.
              </p>
              <p className="mt-2 text-amber-800">
                Get sandbox credentials free at{" "}
                <a className="underline" href="https://dashboard.plaid.com/team/keys" target="_blank" rel="noreferrer">
                  dashboard.plaid.com
                </a>
                . Sandbox banks let you log in with username <code>user_good</code> / password <code>pass_good</code>.
              </p>
            </div>
          </div>
        </Card>
      )}

      {configured && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Connect a new bank</p>
              <p className="text-xs text-slate-500">
                Daybook will import transactions and balances. A daily sync keeps everything fresh.
              </p>
            </div>
            <PlaidLinkLauncher />
          </div>
        </Card>
      )}

      {configured && items.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No banks connected yet.</p>
        </Card>
      ) : null}

      {items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <Card key={it.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {it.institution_name ?? "Bank"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {it.last_synced_at
                        ? `Synced ${format(new Date(it.last_synced_at), "MMM d, h:mm a")}`
                        : "Not synced yet"}
                    </p>
                  </div>
                </div>
                <ItemActions id={it.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
