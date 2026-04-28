"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCategoryAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Plus className="h-4 w-4" />
      {pending ? "Adding…" : "Add"}
    </Button>
  );
}

export function CategoryForm({ kind }: { kind: "income" | "expense" }) {
  const [state, formAction] = useFormState(createCategoryAction, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="kind" value={kind} />
      <div className="flex-1">
        <Input name="name" placeholder="New category name" required />
      </div>
      <SubmitButton />
      {state.error && <p className="w-full text-xs text-red-600 sm:absolute">{state.error}</p>}
    </form>
  );
}
