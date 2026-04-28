"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SCRIPT_URL = "https://cdn.teller.io/connect/connect.js";

type TellerSetupSuccess = {
  accessToken: string;
  enrollment: {
    id: string;
    institution?: { id: string; name: string };
  };
};

type TellerConnectInstance = { open: () => void };

type TellerConnectGlobal = {
  setup(opts: {
    applicationId: string;
    environment: "sandbox" | "development" | "production";
    products: string[];
    onInit?: () => void;
    onSuccess: (enrollment: TellerSetupSuccess) => void;
    onExit?: () => void;
    onFailure?: (failure: unknown) => void;
  }): TellerConnectInstance;
};

declare global {
  interface Window {
    TellerConnect?: TellerConnectGlobal;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") return reject(new Error("Not in browser"));
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if ((existing as HTMLScriptElement).dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Script failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Failed to load Teller Connect"));
    document.head.appendChild(s);
  });
}

export function TellerConnectLauncher({
  applicationId,
  environment,
}: {
  applicationId: string;
  environment: "sandbox" | "development" | "production";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instanceRef = useRef<TellerConnectInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadScript(SCRIPT_URL)
      .then(() => {
        if (cancelled) return;
        if (!window.TellerConnect) throw new Error("TellerConnect global missing");
        instanceRef.current = window.TellerConnect.setup({
          applicationId,
          environment,
          products: ["transactions", "balance"],
          onSuccess: async (payload) => {
            setBusy(true);
            try {
              const res = await fetch("/api/teller/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  accessToken: payload.accessToken,
                  enrollment: payload.enrollment,
                }),
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error ?? "Failed to save enrollment");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          },
          onExit: () => setBusy(false),
          onFailure: (failure) => {
            setError(typeof failure === "string" ? failure : "Teller Connect failed");
            setBusy(false);
          },
        });
      })
      .catch((e: unknown) => setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [applicationId, environment, router]);

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={() => instanceRef.current?.open()}
        disabled={busy || !instanceRef.current}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing…
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4" />
            Connect bank (Teller)
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
