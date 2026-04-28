import Link from "next/link";
import { format, subDays } from "date-fns";
import { ListChecks, Plus, Sparkles } from "lucide-react";
import { listHabits, listRecentEntries, computeStreak } from "@/lib/db/habits";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";
import { HabitCard } from "./HabitCard";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [habits, entries] = await Promise.all([
    listHabits(),
    listRecentEntries(90),
  ]);

  // index entries: { habitId: { date: count } }
  const byHabit: Record<string, Record<string, number>> = {};
  for (const e of entries) {
    byHabit[e.habit_id] ??= {};
    byHabit[e.habit_id][e.date] = e.count;
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const last7 = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd"),
  );

  return (
    <>
      <PageHeader
        title="Habits"
        description={habits.length === 0 ? "Track what you do every day." : `${habits.length} habit${habits.length === 1 ? "" : "s"}`}
        section="habits"
        icon={ListChecks}
        actions={
          <Link href="/habits/new">
            <Button>
              <Plus className="h-4 w-4" />
              New habit
            </Button>
          </Link>
        }
      />

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet."
          hint="Add your first habit and start a streak."
          icon={Sparkles}
          gradient={accents.habits.gradient}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {habits.map((h) => {
            const counts = byHabit[h.id] ?? {};
            const streak = computeStreak(h, counts, new Date());
            return (
              <HabitCard
                key={h.id}
                habit={h}
                today={today}
                last7={last7}
                counts={counts}
                streak={streak}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
