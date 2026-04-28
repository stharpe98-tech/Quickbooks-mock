import { Configuration, PlaidApi, PlaidEnvironments, type CountryCode, type Products } from "plaid";

export type PlaidEnv = "sandbox" | "development" | "production";

export function getPlaidEnv(): PlaidEnv {
  const v = (process.env.PLAID_ENV ?? "sandbox").toLowerCase();
  if (v === "production") return "production";
  if (v === "development") return "development";
  return "sandbox";
}

export function isPlaidConfigured(): boolean {
  return Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}

export function getPlaidClient(): PlaidApi {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    throw new Error(
      "Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in your env vars.",
    );
  }
  const env = getPlaidEnv();
  const config = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });
  return new PlaidApi(config);
}

export const PLAID_PRODUCTS = ["transactions"] as Products[];
export const PLAID_COUNTRY_CODES = ["US"] as CountryCode[];
