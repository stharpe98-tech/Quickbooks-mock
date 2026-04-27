"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { createExpenseAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save expense"}
    </Button>
  );
}

export function ExpenseForm() {
  const [state, formAction] = useFormState(createExpenseAction, { error: null });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="expense_date" type="date" label="Date" defaultValue={today} required />
        <Input
          name="amount"
          label="Amount (USD)"
          inputMode="decimal"
          placeholder="0.00"
          required
        />
      </div>
      <Input name="vendor" label="Vendor" placeholder="Office Depot" required />
      <Input name="category" label="Category" placeholder="Office supplies" />
      <Textarea name="notes" label="Notes" placeholder="Optional" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}
