"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteGoalAction } from "../actions";

export function DeleteGoalButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete goal "${name}"?`)) return;
        start(() => deleteGoalAction(id));
      }}
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting…" : "Delete goal"}
    </Button>
  );
}
