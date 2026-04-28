"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteJournalAction } from "../actions";

export function DeleteJournalButton({ id, date }: { id: string; date: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete journal entry for ${date}?`)) return;
        start(() => deleteJournalAction(id));
      }}
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting…" : "Delete entry"}
    </Button>
  );
}
