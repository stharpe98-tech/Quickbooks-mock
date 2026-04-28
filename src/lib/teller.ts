import { fetch as undiciFetch, Agent } from "undici";
import { getAnyAppSettings } from "@/lib/db/settings";

export type TellerEnv = "sandbox" | "development" | "production";

const TELLER_BASE = "https://api.teller.io";

function normalizeEnv(v: string | null | undefined): TellerEnv | null {
  const s = (v ?? "").toLowerCase();
  if (s === "production" || s === "development" || s === "sandbox") return s;
  return null;
}

type TellerCreds = {
  applicationId: string;
  cert: string;
  key: string;
  env: TellerEnv;
};

/** Env vars first, app_settings row second. */
async function resolveCreds(): Promise<TellerCreds | null> {
  const envApp = process.env.TELLER_APPLICATION_ID;
  const envCert = process.env.TELLER_CERTIFICATE;
  const envKey = process.env.TELLER_PRIVATE_KEY;
  const envEnv = normalizeEnv(process.env.TELLER_ENV);

  if (envApp && envCert && envKey) {
    return {
      applicationId: envApp,
      cert: envCert,
      key: envKey,
      env: envEnv ?? "sandbox",
    };
  }

  const settings = await getAnyAppSettings();
  if (
    settings?.teller_application_id &&
    settings?.teller_certificate &&
    settings?.teller_private_key
  ) {
    return {
      applicationId: settings.teller_application_id,
      cert: settings.teller_certificate,
      key: settings.teller_private_key,
      env: normalizeEnv(settings.teller_env) ?? "sandbox",
    };
  }
  return null;
}

export async function isTellerConfigured(): Promise<boolean> {
  return (await resolveCreds()) !== null;
}

export async function getTellerEnv(): Promise<TellerEnv> {
  return (await resolveCreds())?.env ?? "sandbox";
}

/**
 * Public application_id only (safe to expose client-side for Teller Connect).
 * Never returns cert/key.
 */
export async function getTellerPublicConfig(): Promise<{
  applicationId: string;
  env: TellerEnv;
} | null> {
  const creds = await resolveCreds();
  if (!creds) return null;
  return { applicationId: creds.applicationId, env: creds.env };
}

/**
 * Make an authenticated Teller API call using mTLS + the per-enrollment access
 * token as Basic-auth username (Teller convention: token in the user slot,
 * empty password).
 */
export async function tellerFetch<T>(path: string, accessToken: string): Promise<T> {
  const creds = await resolveCreds();
  if (!creds) throw new Error("Teller is not configured");

  const dispatcher = new Agent({
    connect: {
      cert: creds.cert,
      key: creds.key,
    },
  });

  const url = `${TELLER_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const auth = Buffer.from(`${accessToken}:`).toString("base64");

  const res = await undiciFetch(url, {
    method: "GET",
    dispatcher,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Teller ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
