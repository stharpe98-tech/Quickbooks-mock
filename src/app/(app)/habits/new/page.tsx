import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { HabitForm } from "./HabitForm";

export default function NewHabitPage() {
  return (
    <>
      <PageHeader
        title="New habit"
        description="Something you want to do every day or every week."
        section="habits"
        icon={ListChecks}
      />
      <Card>
        <HabitForm />
      </Card>
    </>
  );
}
