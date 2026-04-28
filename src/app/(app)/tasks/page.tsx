import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, CheckSquare, Plus, Sparkles } from "lucide-react";
import { listTasks, type TaskFilter } from "@/lib/db/tasks";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";
import { PriorityBadge } from "@/components/ui/Badge";
import { accents } from "@/lib/theme";
import { TaskCheckbox } from "./TaskCheckbox";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { TaskFilters } from "./TaskFilters";

export const dynamic = "force-dynamic";

const ALLOWED_FILTERS: TaskFilter[] = ["open", "today", "overdue", "completed", "all"];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = (ALLOWED_FILTERS.includes(searchParams.filter as TaskFilter)
    ? (searchParams.filter as TaskFilter)
    : "open") as TaskFilter;
  const tasks = await listTasks(filter);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Open work, due dates, priorities."
        section="tasks"
        icon={CheckSquare}
        actions={
          <Link href="/tasks/new">
            <Button>
              <Plus className="h-4 w-4" />
              New task
            </Button>
          </Link>
        }
      />

      <TaskFilters />

      {tasks.length === 0 ? (
        <EmptyState
          title={filter === "completed" ? "No completed tasks." : "Nothing here — nice."}
          hint={filter === "open" ? "Add your first task to get organized." : undefined}
          icon={Sparkles}
          gradient={accents.tasks.gradient}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {tasks.map((t) => {
              const overdue = t.due_at && t.due_at < todayIso && !t.completed_at;
              const dueToday = t.due_at === todayIso;
              return (
                <li key={t.id} className="flex items-start gap-3 py-3">
                  <TaskCheckbox id={t.id} completed={Boolean(t.completed_at)} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        t.completed_at ? "text-slate-400 line-through" : "text-slate-900"
                      }`}
                    >
                      {t.title}
                    </p>
                    {t.notes && <p className="mt-0.5 text-xs text-slate-500">{t.notes}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {t.due_at && (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            overdue ? "text-rose-700" : dueToday ? "text-amber-700" : ""
                          }`}
                        >
                          <CalendarClock className="h-3 w-3" />
                          {format(new Date(t.due_at), "MMM d, yyyy")}
                          {overdue ? " · overdue" : dueToday ? " · today" : ""}
                        </span>
                      )}
                      {t.project && (
                        <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                          {t.project.name}
                        </span>
                      )}
                      {t.priority > 0 && <PriorityBadge priority={t.priority} />}
                    </div>
                  </div>
                  <DeleteTaskButton id={t.id} />
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
