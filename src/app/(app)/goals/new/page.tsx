import { Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { GoalForm } from "./GoalForm";

export default function NewGoalPage() {
  return (
    <>
      <PageHeader title="New goal" description="Set a target to work toward." section="goals" icon={Target} />
      <Card>
        <GoalForm />
      </Card>
    </>
  );
}
