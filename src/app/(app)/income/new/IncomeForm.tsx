"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { createIncomeAction } from "../actions";

type Option = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save income"}
    </Button>
  );
}

export function IncomeForm({
  categories,
  accounts,
}: {
  categories: Option[];
  accounts: Option[];
}) {
  const [state, formAction] = useFormState(createIncomeAction, { error: null });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="date" type="date" label="Date" defaultValue={today} required />
        <Input name="amount" label="Amount (USD)" inputMode="decimal" placeholder="0.00" required />
      </div>
      <Input name="source" label="Source" placeholder="Paycheck, client invoice, refund…" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category_id" label="Category" defaultValue="">
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select name="account_id" label="Deposit to account" defaultValue="">
          <option value="">— None —</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea name="notes" label="Notes" placeholder="Optional" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
