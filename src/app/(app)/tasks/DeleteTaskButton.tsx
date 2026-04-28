"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteTaskAction } from "./actions";

export function DeleteTaskButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label="Delete task"
      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      onClick={() => {
        if (!confirm("Delete this task?")) return;
        start(() => deleteTaskAction(id));
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
