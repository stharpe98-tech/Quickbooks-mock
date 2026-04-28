"use client";

import { useTransition } from "react";
import { CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toggleGoalCompletedAction } from "../actions";

export function ToggleCompleteButton({ id, completed }: { id: string; completed: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant={completed ? "secondary" : "primary"}
      size="sm"
      disabled={pending}
      onClick={() => start(() => toggleGoalCompletedAction(id, !completed))}
    >
      {completed ? <Undo2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      {pending ? "…" : completed ? "Reopen" : "Mark complete"}
    </Button>
  );
}
