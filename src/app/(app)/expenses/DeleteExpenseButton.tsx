"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteExpenseAction } from "./actions";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this expense?")) return;
        start(() => deleteExpenseAction(id));
      }}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
