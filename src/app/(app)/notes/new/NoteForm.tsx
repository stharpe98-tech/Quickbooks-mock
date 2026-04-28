"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { createNoteAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save note"}
    </Button>
  );
}

export function NoteForm() {
  const [state, formAction] = useFormState(createNoteAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <Input name="title" label="Title (optional)" placeholder="Title" />
      <Textarea
        name="body"
        label="Body"
        placeholder="Write…"
        className="min-h-[240px] font-mono text-sm"
        autoFocus
      />
      <Input
        name="tags"
        label="Tags"
        placeholder="Comma-separated, e.g. ideas, work, weekend"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
