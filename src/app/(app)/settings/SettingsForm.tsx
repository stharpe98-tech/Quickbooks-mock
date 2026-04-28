"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Banknote, CheckCircle2, Eye, EyeOff, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { saveSettingsAction } from "./actions";

type Initial = {
  plaid_client_id: string | null;
  plaid_secret: string | null;
  plaid_env: "sandbox" | "development" | "production";
  cron_secret: string | null;
};

type Masks = {
  plaid_client_id: string | null;
  plaid_secret: string | null;
  cron_secret: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function StatusBadge({ children, tone }: { children: React.ReactNode; tone: "ok" | "muted" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {children}
    </span>
  );
}

function SecretInput({
  name,
  label,
  placeholder,
  currentMask,
  onClear,
  cleared,
}: {
  name: string;
  label: string;
  placeholder: string;
  currentMask: string | null;
  onClear: () => void;
  cleared: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {currentMask && !cleared && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            Clear
          </button>
        )}
      </div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          autoComplete="off"
          placeholder={
            cleared
              ? "(will be cleared on save)"
              : currentMask
                ? `current: ${currentMask}`
                : placeholder
          }
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Leave blank to keep the existing value.
      </p>
    </div>
  );
}

export function SettingsForm({
  initial,
  masks,
  envOverrides,
}: {
  initial: Initial;
  masks: Masks;
  envOverrides: { plaid: boolean; cron: boolean };
}) {
  const [state, formAction] = useFormState(saveSettingsAction, { error: null, ok: false });
  const [clearPlaidId, setClearPlaidId] = useState(false);
  const [clearPlaidSecret, setClearPlaidSecret] = useState(false);
  const [clearCron, setClearCron] = useState(false);

  const plaidConfigured = Boolean(masks.plaid_client_id && masks.plaid_secret);

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden inputs the form sets when "Clear" is clicked. */}
      <input type="hidden" name="clear_plaid_client_id" value={clearPlaidId ? "1" : ""} />
      <input type="hidden" name="clear_plaid_secret" value={clearPlaidSecret ? "1" : ""} />
      <input type="hidden" name="clear_cron_secret" value={clearCron ? "1" : ""} />

      {/* ─── Plaid ─────────────────────────────────────────── */}
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 text-white">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Plaid</p>
              <p className="text-xs text-slate-500">
                Bank connections, transaction sync, balances.
              </p>
            </div>
          </div>
          {envOverrides.plaid ? (
            <StatusBadge tone="muted">Env override active</StatusBadge>
          ) : plaidConfigured ? (
            <StatusBadge tone="ok">
              <CheckCircle2 className="h-3 w-3" />
              Configured
            </StatusBadge>
          ) : (
            <StatusBadge tone="muted">Not configured</StatusBadge>
          )}
        </div>

        {envOverrides.plaid && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
            <code className="rounded bg-amber-100 px-1">PLAID_CLIENT_ID</code> /{" "}
            <code className="rounded bg-amber-100 px-1">PLAID_SECRET</code> are set as environment
            variables. Those take precedence — values you save here are kept as a backup but
            won&apos;t be used until the env vars are removed.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="plaid_client_id" className="block text-sm font-medium text-slate-700">
                Client ID
              </label>
              {masks.plaid_client_id && !clearPlaidId && (
                <button
                  type="button"
                  onClick={() => setClearPlaidId(true)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              name="plaid_client_id"
              id="plaid_client_id"
              autoComplete="off"
              placeholder={
                clearPlaidId
                  ? "(will be cleared on save)"
                  : masks.plaid_client_id
                    ? `current: ${masks.plaid_client_id}`
                    : "67e23acc..."
              }
            />
            <p className="text-xs text-slate-500">Leave blank to keep the existing value.</p>
          </div>

          <Select
            name="plaid_env"
            label="Environment"
            defaultValue={initial.plaid_env}
          >
            <option value="sandbox">Sandbox</option>
            <option value="development">Development</option>
            <option value="production">Production</option>
          </Select>
        </div>

        <div className="mt-4">
          <SecretInput
            name="plaid_secret"
            label="Secret"
            placeholder="Plaid secret"
            currentMask={masks.plaid_secret}
            cleared={clearPlaidSecret}
            onClear={() => setClearPlaidSecret(true)}
          />
        </div>
      </Card>

      {/* ─── Cron ──────────────────────────────────────────── */}
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white">
              <Timer className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Cron secret</p>
              <p className="text-xs text-slate-500">
                Bearer token for the daily recurring/Plaid sync at <code>/api/cron/run-recurring</code>.
              </p>
            </div>
          </div>
          {envOverrides.cron ? (
            <StatusBadge tone="muted">Env override active</StatusBadge>
          ) : masks.cron_secret ? (
            <StatusBadge tone="ok">
              <CheckCircle2 className="h-3 w-3" />
              Configured
            </StatusBadge>
          ) : (
            <StatusBadge tone="muted">Open access</StatusBadge>
          )}
        </div>

        {envOverrides.cron && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
            <code className="rounded bg-amber-100 px-1">CRON_SECRET</code> env var is set and takes
            precedence.
          </p>
        )}

        <SecretInput
          name="cron_secret"
          label="Secret"
          placeholder="Random string — recommended"
          currentMask={masks.cron_secret}
          cleared={clearCron}
          onClear={() => setClearCron(true)}
        />
      </Card>

      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
          Settings saved.
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
