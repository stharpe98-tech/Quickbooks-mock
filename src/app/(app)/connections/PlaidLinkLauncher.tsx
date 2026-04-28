"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink, type PlaidLinkOnSuccess } from "react-plaid-link";
import { Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlaidLinkLauncher() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a fresh Link token when the user clicks "Connect".
  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plaid/link-token", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to start link");
      setLinkToken(json.link_token);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSuccess: PlaidLinkOnSuccess = useCallback(
    async (publicToken) => {
      setExchanging(true);
      setError(null);
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to connect bank");
        setLinkToken(null);
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setExchanging(false);
      }
    },
    [router],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => setLinkToken(null),
  });

  // Auto-open Plaid Link as soon as we have a token + the SDK is ready.
  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  const busy = loading || exchanging;

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={fetchToken} disabled={busy}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {exchanging ? "Importing…" : "Starting…"}
          </>
        ) : (
          <>
            <Banknote className="h-4 w-4" />
            Connect bank
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
