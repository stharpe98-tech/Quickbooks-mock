"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Building2, CheckCircle2, Eye, EyeOff, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { saveSettingsAction } from "./actions";

type Initial = {
  cron_secret: string | null;
  teller_application_id: string | null;
  teller_env: "sandbox" | "development" | "production";
};

type Masks = {
  cron_secret: string | null;
  teller_application_id: string | null;
  teller_certificate: string | null;
  teller_private_key: string | null;
  teller_signing_secret: string | null;
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
      <p className="text-xs text-slate-500">Leave blank to keep the existing value.</p>
    </div>
  );
}

function PemTextarea({
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
      <Textarea
        name={name}
        id={name}
        autoComplete="off"
        spellCheck={false}
        rows={6}
        className="font-mono text-xs"
        placeholder={
          cleared
            ? "(will be cleared on save)"
            : currentMask
              ? `current: ${currentMask}`
              : placeholder
        }
      />
      <p className="text-xs text-slate-500">
        Paste the full PEM (including the <code className="rounded bg-slate-100 px-1">-----BEGIN…-----</code> /{" "}
        <code className="rounded bg-slate-100 px-1">-----END…-----</code> lines). Leave blank to keep the existing value.
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
  envOverrides: { cron: boolean; teller: boolean };
}) {
  const [state, formAction] = useFormState(saveSettingsAction, { error: null, ok: false });
  const [clearCron, setClearCron] = useState(false);
  const [clearTellerAppId, setClearTellerAppId] = useState(false);
  const [clearTellerCert, setClearTellerCert] = useState(false);
  const [clearTellerKey, setClearTellerKey] = useState(false);
  const [clearTellerSigning, setClearTellerSigning] = useState(false);

  const tellerConfigured = Boolean(
    masks.teller_application_id && masks.teller_certificate && masks.teller_private_key,
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden inputs the form sets when "Clear" is clicked. */}
      <input type="hidden" name="clear_cron_secret" value={clearCron ? "1" : ""} />
      <input
        type="hidden"
        name="clear_teller_application_id"
        value={clearTellerAppId ? "1" : ""}
      />
      <input
        type="hidden"
        name="clear_teller_certificate"
        value={clearTellerCert ? "1" : ""}
      />
      <input
        type="hidden"
        name="clear_teller_private_key"
        value={clearTellerKey ? "1" : ""}
      />
      <input
        type="hidden"
        name="clear_teller_signing_secret"
        value={clearTellerSigning ? "1" : ""}
      />

      {/* ─── Teller ────────────────────────────────────────── */}
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Teller</p>
              <p className="text-xs text-slate-500">
                Bank connections via mTLS client certificates. Free dev tier, US banks.
              </p>
            </div>
          </div>
          {envOverrides.teller ? (
            <StatusBadge tone="muted">Env override active</StatusBadge>
          ) : tellerConfigured ? (
            <StatusBadge tone="ok">
              <CheckCircle2 className="h-3 w-3" />
              Configured
            </StatusBadge>
          ) : (
            <StatusBadge tone="muted">Not configured</StatusBadge>
          )}
        </div>

        {envOverrides.teller && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
            <code className="rounded bg-amber-100 px-1">TELLER_APPLICATION_ID</code> /{" "}
            <code className="rounded bg-amber-100 px-1">TELLER_CERTIFICATE</code> /{" "}
            <code className="rounded bg-amber-100 px-1">TELLER_PRIVATE_KEY</code> env vars are set
            and take precedence.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="teller_application_id"
                className="block text-sm font-medium text-slate-700"
              >
                Application ID
              </label>
              {masks.teller_application_id && !clearTellerAppId && (
                <button
                  type="button"
                  onClick={() => setClearTellerAppId(true)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              name="teller_application_id"
              id="teller_application_id"
              autoComplete="off"
              placeholder={
                clearTellerAppId
                  ? "(will be cleared on save)"
                  : masks.teller_application_id
                    ? `current: ${masks.teller_application_id}`
                    : "app_..."
              }
            />
            <p className="text-xs text-slate-500">Leave blank to keep the existing value.</p>
          </div>

          <Select name="teller_env" label="Environment" defaultValue={initial.teller_env}>
            <option value="sandbox">Sandbox</option>
            <option value="development">Development</option>
            <option value="production">Production</option>
          </Select>
        </div>

        <div className="mt-4 grid gap-4">
          <PemTextarea
            name="teller_certificate"
            label="Certificate (cert.pem)"
            placeholder={"-----BEGIN CERTIFICATE-----\nMIIB…\n-----END CERTIFICATE-----"}
            currentMask={masks.teller_certificate}
            cleared={clearTellerCert}
            onClear={() => setClearTellerCert(true)}
          />
          <PemTextarea
            name="teller_private_key"
            label="Private key (private_key.pem)"
            placeholder={"-----BEGIN PRIVATE KEY-----\nMIIE…\n-----END PRIVATE KEY-----"}
            currentMask={masks.teller_private_key}
            cleared={clearTellerKey}
            onClear={() => setClearTellerKey(true)}
          />
          <SecretInput
            name="teller_signing_secret"
            label="Signing secret (optional, for webhooks)"
            placeholder="ws_..."
            currentMask={masks.teller_signing_secret}
            cleared={clearTellerSigning}
            onClear={() => setClearTellerSigning(true)}
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
                Bearer token for the daily Teller + recurring sync at <code>/api/cron/run-recurring</code>.
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
