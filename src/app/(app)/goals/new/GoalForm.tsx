"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { createGoalAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save goal"}
    </Button>
  );
}

export function GoalForm() {
  const [state, formAction] = useFormState(createGoalAction, { error: null });
  const [kind, setKind] = useState<"milestone" | "numeric">("milestone");

  return (
    <form action={formAction} className="space-y-4">
      <Input name="name" label="Name" placeholder="Save $5,000, run a half-marathon, finish book…" required />
      <Textarea name="description" label="Description (optional)" placeholder="Why this matters…" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="kind"
          label="Kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as "milestone" | "numeric")}
        >
          <option value="milestone">Milestone (mark complete when done)</option>
          <option value="numeric">Numeric (track progress)</option>
        </Select>
        <Input name="target_date" type="date" label="Target date (optional)" />
      </div>
      {kind === "numeric" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="target_value"
            label="Target value"
            inputMode="decimal"
            placeholder="e.g. 5000"
            required={kind === "numeric"}
          />
          <Input name="unit" label="Unit (optional)" placeholder="lbs, miles, USD, books…" />
        </div>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
