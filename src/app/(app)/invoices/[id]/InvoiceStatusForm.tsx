"use client";

import { useTransition } from "react";
import type { InvoiceStatus } from "@/lib/db/types";
import { Select } from "@/components/ui/Input";
import { updateInvoiceStatusAction } from "../actions";

export function InvoiceStatusForm({ id, status }: { id: string; status: InvoiceStatus }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(formData) => {
        start(() => updateInvoiceStatusAction(id, formData));
      }}
    >
      <Select
        name="status"
        label="Change status"
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const fd = new FormData();
          fd.set("status", e.target.value);
          start(() => updateInvoiceStatusAction(id, fd));
        }}
      >
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
      </Select>
      {pending && <p className="mt-1 text-xs text-slate-500">Saving…</p>}
    </form>
  );
}
