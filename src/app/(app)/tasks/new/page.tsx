import { CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { listProjects } from "@/lib/db/tasks";
import { TaskForm } from "./TaskForm";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const projects = await listProjects();

  return (
    <>
      <PageHeader title="New task" description="Capture something to do." section="tasks" icon={CheckSquare} />
      <Card>
        <TaskForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
      </Card>
    </>
  );
}
