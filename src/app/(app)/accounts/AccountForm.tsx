"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { createAccountAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Add account"}
    </Button>
  );
}

export function AccountForm() {
  const [state, formAction] = useFormState(createAccountAction, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Input name="name" label="Account name" placeholder="Chase Checking" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="kind" label="Kind" defaultValue="checking" required>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit_card">Credit card</option>
          <option value="cash">Cash</option>
          <option value="investment">Investment</option>
          <option value="loan">Loan</option>
          <option value="other">Other</option>
        </Select>
        <Input name="balance" label="Current balance (USD)" inputMode="decimal" placeholder="0.00" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
