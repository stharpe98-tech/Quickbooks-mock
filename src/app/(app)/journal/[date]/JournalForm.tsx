"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { upsertJournalAction } from "../actions";

const MOODS: { value: number; label: string; bg: string; bgActive: string }[] = [
  { value: 1, label: "Awful", bg: "bg-rose-100 text-rose-800", bgActive: "bg-rose-500 text-white shadow" },
  { value: 2, label: "Bad", bg: "bg-orange-100 text-orange-800", bgActive: "bg-orange-500 text-white shadow" },
  { value: 3, label: "OK", bg: "bg-amber-100 text-amber-800", bgActive: "bg-amber-500 text-white shadow" },
  { value: 4, label: "Good", bg: "bg-lime-100 text-lime-800", bgActive: "bg-lime-500 text-white shadow" },
  { value: 5, label: "Great", bg: "bg-emerald-100 text-emerald-800", bgActive: "bg-emerald-500 text-white shadow" },
];

function SubmitButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || !dirty}>
      {pending ? "Saving…" : dirty ? "Save entry" : "Saved"}
    </Button>
  );
}

export function JournalForm({
  date,
  initial,
}: {
  date: string;
  initial: { body: string; mood: number | null };
}) {
  const [state, formAction] = useFormState(upsertJournalAction, { error: null });
  const [body, setBody] = useState(initial.body);
  const [mood, setMood] = useState<number | null>(initial.mood);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(body !== initial.body || mood !== initial.mood);
  }, [body, mood, initial]);

  useEffect(() => {
    if (state.error === null) setDirty(false);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="mood" value={mood ?? ""} />

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Mood</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const active = mood === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(active ? null : m.value)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
                  active ? m.bgActive : m.bg,
                )}
              >
                <span
                  className={clsx(
                    "block h-2 w-2 rounded-full",
                    active ? "bg-white" : "bg-current opacity-70",
                  )}
                  aria-hidden
                />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <Textarea
        name="body"
        label="Entry"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How was today?"
        className="min-h-[300px] font-mono text-sm"
        autoFocus={!initial.body}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <SubmitButton dirty={dirty} />
      </div>
    </form>
  );
}
