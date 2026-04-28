import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Target } from "lucide-react";
import { getGoal } from "@/lib/db/goals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { UpdateProgressForm } from "./UpdateProgressForm";
import { ToggleCompleteButton } from "./ToggleCompleteButton";
import { DeleteGoalButton } from "./DeleteGoalButton";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const goal = await getGoal(params.id);
  if (!goal) notFound();

  const target = goal.target_value ? Number(goal.target_value) : null;
  const current = Number(goal.current_value ?? 0);
  const pct = target && target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;
  const completed = Boolean(goal.completed_at);

  return (
    <>
      <PageHeader
        title={goal.name}
        description={goal.target_date ? `Target ${format(new Date(goal.target_date), "MMM d, yyyy")}` : undefined}
        section="goals"
        icon={Target}
        actions={
          <Link href="/goals">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      {completed && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          Completed on {format(new Date(goal.completed_at!), "MMM d, yyyy")}.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Details
          </h2>
          {goal.description ? (
            <p className="whitespace-pre-wrap text-sm text-slate-700">{goal.description}</p>
          ) : (
            <p className="text-sm text-slate-400">No description.</p>
          )}

          {goal.kind === "numeric" && target !== null && (
            <div className="mt-6 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Progress
                </span>
                <span className="tabular-nums text-sm font-semibold text-slate-900">
                  {current} / {target}
                  {goal.unit ? ` ${goal.unit}` : ""}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-600 transition-all"
                  style={{ width: `${pct ?? 0}%` }}
                />
              </div>
              <p className="text-right text-xs tabular-nums text-slate-500">{pct ?? 0}%</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </h2>

          {goal.kind === "numeric" && (
            <div className="mb-4">
              <UpdateProgressForm id={goal.id} current={current} unit={goal.unit ?? undefined} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <ToggleCompleteButton id={goal.id} completed={completed} />
            <DeleteGoalButton id={goal.id} name={goal.name} />
          </div>
        </Card>
      </div>
    </>
  );
}
