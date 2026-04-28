"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { updateNoteAction } from "../actions";

function SubmitButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || !dirty}>
      {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
    </Button>
  );
}

export function EditNoteForm({
  id,
  initial,
}: {
  id: string;
  initial: { title: string; body: string; tags: string };
}) {
  const [state, formAction] = useFormState(updateNoteAction.bind(null, id), { error: null });
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState(initial.tags);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(
      title !== initial.title || body !== initial.body || tags !== initial.tags,
    );
  }, [title, body, tags, initial]);

  // After a successful save, snapshot becomes the new "clean" state.
  useEffect(() => {
    if (state.error === null) setDirty(false);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        name="title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <Textarea
        name="body"
        label="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
      />
      <Input
        name="tags"
        label="Tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Comma-separated"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton dirty={dirty} />
      </div>
    </form>
  );
}
