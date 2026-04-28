import { Configuration, PlaidApi, PlaidEnvironments, type CountryCode, type Products } from "plaid";
import { getAnyAppSettings } from "@/lib/db/settings";

export type PlaidEnv = "sandbox" | "development" | "production";

function normalizeEnv(v: string | null | undefined): PlaidEnv | null {
  const s = (v ?? "").toLowerCase();
  if (s === "production" || s === "development" || s === "sandbox") return s;
  return null;
}

type PlaidCreds = { clientId: string; secret: string; env: PlaidEnv };

/**
 * Resolve Plaid creds in order of preference:
 *   1. process.env.PLAID_*  (production / Vercel deploys)
 *   2. app_settings row in the database (in-app /settings page)
 * Returns null if nothing is configured.
 */
async function resolveCreds(): Promise<PlaidCreds | null> {
  const envClient = process.env.PLAID_CLIENT_ID;
  const envSecret = process.env.PLAID_SECRET;
  const envEnv = normalizeEnv(process.env.PLAID_ENV);

  if (envClient && envSecret) {
    return { clientId: envClient, secret: envSecret, env: envEnv ?? "sandbox" };
  }

  const settings = await getAnyAppSettings();
  if (settings?.plaid_client_id && settings?.plaid_secret) {
    return {
      clientId: settings.plaid_client_id,
      secret: settings.plaid_secret,
      env: normalizeEnv(settings.plaid_env) ?? "sandbox",
    };
  }
  return null;
}

export async function isPlaidConfigured(): Promise<boolean> {
  const creds = await resolveCreds();
  return creds !== null;
}

export async function getPlaidEnv(): Promise<PlaidEnv> {
  const creds = await resolveCreds();
  return creds?.env ?? "sandbox";
}

export async function getPlaidClient(): Promise<PlaidApi> {
  const creds = await resolveCreds();
  if (!creds) {
    throw new Error(
      "Plaid is not configured. Add credentials in /settings or set PLAID_CLIENT_ID and PLAID_SECRET env vars.",
    );
  }
  const config = new Configuration({
    basePath: PlaidEnvironments[creds.env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": creds.clientId,
        "PLAID-SECRET": creds.secret,
      },
    },
  });
  return new PlaidApi(config);
}

export const PLAID_PRODUCTS = ["transactions"] as Products[];
export const PLAID_COUNTRY_CODES = ["US"] as CountryCode[];
