"use client";

import { useTransition } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toggleRecurringActiveAction } from "./actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={active ? "Pause" : "Resume"}
      className="text-slate-600 hover:bg-slate-100"
      onClick={() => start(() => toggleRecurringActiveAction(id, !active))}
    >
      {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </Button>
  );
}
