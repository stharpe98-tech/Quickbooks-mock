"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateGoalProgressAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : "Update"}
    </Button>
  );
}

export function UpdateProgressForm({
  id,
  current,
  unit,
}: {
  id: string;
  current: number;
  unit?: string;
}) {
  const [state, formAction] = useFormState(updateGoalProgressAction.bind(null, id), {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-2">
      <label htmlFor="current_value" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        Update progress {unit ? `(${unit})` : ""}
      </label>
      <div className="flex gap-2">
        <Input
          id="current_value"
          name="current_value"
          inputMode="decimal"
          defaultValue={String(current)}
          required
          className="flex-1"
        />
        <SubmitButton />
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
