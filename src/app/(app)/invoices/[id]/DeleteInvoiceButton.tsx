"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteInvoiceAction } from "../actions";

export function DeleteInvoiceButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this invoice? This cannot be undone.")) return;
        start(() => deleteInvoiceAction(id));
      }}
    >
      {pending ? "Deleting…" : "Delete invoice"}
    </Button>
  );
}
