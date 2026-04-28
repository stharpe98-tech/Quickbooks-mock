"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteConnectionAction } from "./actions";

export function ItemActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      setMsg(`+${json.added} new, ${json.modified} updated`);
      router.refresh();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button variant="secondary" size="sm" disabled={syncing} onClick={sync} aria-label="Sync now">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          aria-label="Disconnect"
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          onClick={() => {
            if (!confirm("Disconnect this bank? Imported transactions will stay.")) return;
            start(() => deleteConnectionAction(id));
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {msg && <p className="text-[11px] text-slate-500">{msg}</p>}
    </div>
  );
}
