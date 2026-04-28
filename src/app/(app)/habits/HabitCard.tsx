"use client";

import { useOptimistic, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { Flame, Minus, Plus, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Habit } from "@/lib/db/types";
import { adjustHabitEntryAction, deleteHabitAction } from "./actions";

type Props = {
  habit: Habit;
  today: string;
  last7: string[];
  counts: Record<string, number>;
  streak: number;
};

export function HabitCard({ habit, today, last7, counts, streak }: Props) {
  const [pending, start] = useTransition();
  const [optimistic, applyOptimistic] = useOptimistic(
    counts,
    (state: Record<string, number>, action: { date: string; delta: number }) => ({
      ...state,
      [action.date]: Math.max(0, (state[action.date] ?? 0) + action.delta),
    }),
  );

  const todayCount = optimistic[today] ?? 0;
  const target = habit.target_per_period;
  const completedToday = todayCount >= target;

  function adjust(delta: number) {
    start(async () => {
      applyOptimistic({ date: today, delta });
      await adjustHabitEntryAction(habit.id, today, delta);
    });
  }

  function onDelete() {
    if (!confirm(`Delete habit "${habit.name}"? All progress will be removed.`)) return;
    start(() => deleteHabitAction(habit.id));
  }

  return (
    <Card className="relative overflow-hidden">
      <div
        className={clsx(
          "absolute inset-x-0 top-0 h-1",
          completedToday ? "bg-gradient-to-r from-amber-400 to-orange-600" : "bg-slate-100",
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{habit.name}</p>
          <p className="text-xs text-slate-500">
            {habit.frequency === "daily" ? "Daily" : "Weekly"}
            {target > 1 ? ` · ${target}× per ${habit.frequency === "daily" ? "day" : "week"}` : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${habit.name}`}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          onClick={onDelete}
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {habit.frequency === "daily" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              streak > 0
                ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200"
                : "bg-slate-100 text-slate-600",
            )}
          >
            <Flame className="h-3 w-3" />
            {streak}-day streak
          </span>
        </div>
      )}

      {/* 7-day strip */}
      <div className="mt-4">
        <div className="flex items-end justify-between gap-1">
          {last7.map((d) => {
            const c = optimistic[d] ?? 0;
            const ratio = Math.min(1, c / target);
            const isToday = d === today;
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={clsx(
                    "h-10 w-full rounded-md transition-all",
                    ratio >= 1
                      ? "bg-gradient-to-br from-amber-400 to-orange-600"
                      : ratio > 0
                      ? "bg-amber-200"
                      : "bg-slate-100",
                    isToday && "ring-2 ring-amber-500 ring-offset-1",
                  )}
                  title={`${format(parseISO(d), "EEE MMM d")}: ${c}/${target}`}
                />
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {format(parseISO(d), "EEE")[0]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-semibold tabular-nums text-slate-900">{todayCount}</span>
          <span className="text-slate-400"> / {target} today</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => adjust(-1)}
            disabled={pending || todayCount === 0}
            aria-label="Subtract one"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => adjust(1)}
            disabled={pending}
            aria-label="Add one"
            className={clsx(
              completedToday
                ? "from-emerald-500 via-emerald-500 to-teal-600"
                : undefined,
            )}
          >
            <Plus className="h-4 w-4" />
            {completedToday ? "Done" : "Mark"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
