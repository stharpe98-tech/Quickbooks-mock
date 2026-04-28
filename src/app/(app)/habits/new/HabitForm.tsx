"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { createHabitAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save habit"}
    </Button>
  );
}

export function HabitForm() {
  const [state, formAction] = useFormState(createHabitAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <Input name="name" label="Name" placeholder="Read 30 minutes, gym, etc." required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="frequency" label="Frequency" defaultValue="daily" required>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </Select>
        <Input
          name="target_per_period"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          label="Target per period"
          defaultValue={1}
          required
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
