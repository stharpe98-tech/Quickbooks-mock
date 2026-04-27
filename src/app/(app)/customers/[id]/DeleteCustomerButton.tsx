"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteCustomerAction } from "../actions";

export function DeleteCustomerButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this customer? Invoices linked to them will block deletion.")) return;
        start(() => deleteCustomerAction(id));
      }}
    >
      {pending ? "Deleting…" : "Delete customer"}
    </Button>
  );
}
