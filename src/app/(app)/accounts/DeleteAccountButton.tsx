"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteAccountAction } from "./actions";

export function DeleteAccountButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Delete ${name}`}
      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      onClick={() => {
        if (!confirm(`Delete account "${name}"? Linked entries will become unlinked.`)) return;
        start(() => deleteAccountAction(id));
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
