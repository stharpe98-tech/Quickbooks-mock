"use client";

import { useTransition, useState } from "react";
import { Check } from "lucide-react";
import { clsx } from "clsx";
import { toggleTaskCompletedAction } from "./actions";

export function TaskCheckbox({ id, completed }: { id: string; completed: boolean }) {
  const [optimistic, setOptimistic] = useState(completed);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={optimistic}
      disabled={pending}
      onClick={() => {
        const next = !optimistic;
        setOptimistic(next);
        start(() => toggleTaskCompletedAction(id, next));
      }}
      className={clsx(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
        optimistic
          ? "border-violet-500 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm"
          : "border-slate-300 bg-white hover:border-violet-400 hover:bg-violet-50",
        pending && "opacity-60",
      )}
    >
      {optimistic && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}
