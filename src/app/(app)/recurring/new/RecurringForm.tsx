"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { createRecurringAction } from "../actions";

type Option = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save recurring"}
    </Button>
  );
}

export function RecurringForm({
  incomeCategories,
  expenseCategories,
  accounts,
}: {
  incomeCategories: Option[];
  expenseCategories: Option[];
  accounts: Option[];
}) {
  const [state, formAction] = useFormState(createRecurringAction, { error: null });
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const today = new Date().toISOString().slice(0, 10);
  const cats = kind === "income" ? incomeCategories : expenseCategories;

  return (
    <form action={formAction} className="space-y-4">
      <Input name="name" label="Name" placeholder="Rent, Netflix, Paycheck…" required />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="kind" label="Kind" value={kind} onChange={(e) => setKind(e.target.value as "income" | "expense")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Input name="amount" label="Amount (USD)" inputMode="decimal" placeholder="0.00" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category_id" label="Category" defaultValue="">
          <option value="">— None —</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select name="account_id" label="Account" defaultValue="">
          <option value="">— None —</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          name="frequency"
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "weekly" | "monthly" | "yearly")}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>
        {frequency === "monthly" && (
          <Input
            name="day_of_month"
            type="number"
            min={1}
            max={31}
            label="Day of month"
            placeholder="1"
          />
        )}
        {frequency === "weekly" && (
          <Select name="day_of_week" label="Day of week" defaultValue="1">
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </Select>
        )}
        <Input name="start_date" type="date" label="First post on or after" defaultValue={today} required />
      </div>

      <Textarea name="notes" label="Notes (optional)" placeholder="Something to remember about this entry…" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
