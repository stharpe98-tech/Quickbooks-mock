import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Plus, Sparkles, Target } from "lucide-react";
import { listGoals } from "@/lib/db/goals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await listGoals(true);
  const open = goals.filter((g) => !g.completed_at);
  const done = goals.filter((g) => g.completed_at);

  return (
    <>
      <PageHeader
        title="Goals"
        description={open.length === 0 ? "Long-term targets, tracked over time." : `${open.length} open · ${done.length} complete`}
        section="goals"
        icon={Target}
        actions={
          <Link href="/goals/new">
            <Button>
              <Plus className="h-4 w-4" />
              New goal
            </Button>
          </Link>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet."
          hint="Set a goal — saving $X, running X miles, finishing a project."
          icon={Sparkles}
          gradient={accents.goals.gradient}
        />
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {open.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Completed
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {done.map((g) => (
                  <Card key={g.id} className="opacity-70">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/goals/${g.id}`} className="text-sm font-semibold text-slate-700 hover:underline">
                          {g.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          Completed {g.completed_at ? format(new Date(g.completed_at), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function GoalCard({ goal }: { goal: Awaited<ReturnType<typeof listGoals>>[number] }) {
  const target = goal.target_value ? Number(goal.target_value) : null;
  const current = Number(goal.current_value ?? 0);
  const pct = target && target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;
  const targetLabel = target !== null
    ? `${current} / ${target}${goal.unit ? ` ${goal.unit}` : ""}`
    : null;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-400 to-rose-600" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/goals/${goal.id}`}
            className="block truncate text-base font-semibold text-slate-900 hover:text-pink-700"
          >
            {goal.name}
          </Link>
          {goal.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{goal.description}</p>
          )}
          {goal.target_date && (
            <p className="mt-1 text-xs text-slate-500">
              Target {format(new Date(goal.target_date), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>

      {goal.kind === "numeric" && target !== null ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Progress</span>
            <span className="tabular-nums text-sm font-semibold text-slate-900">{targetLabel}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-600 transition-all"
              style={{ width: `${pct ?? 0}%` }}
            />
          </div>
          <p className="text-right text-xs tabular-nums text-slate-500">{pct ?? 0}%</p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">Milestone goal — mark complete when done.</p>
      )}
    </Card>
  );
}
