"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { createTaskAction } from "../actions";

type Option = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save task"}
    </Button>
  );
}

export function TaskForm({ projects }: { projects: Option[] }) {
  const [state, formAction] = useFormState(createTaskAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <Input name="title" label="Title" placeholder="What needs doing?" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="due_at" type="date" label="Due date" />
        <Select name="priority" label="Priority" defaultValue="0">
          <option value="0">Low</option>
          <option value="1">Med</option>
          <option value="2">High</option>
          <option value="3">Urgent</option>
        </Select>
      </div>
      {projects.length > 0 && (
        <Select name="project_id" label="Project" defaultValue="">
          <option value="">— None —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      )}
      <Textarea name="notes" label="Notes" placeholder="Optional details" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
