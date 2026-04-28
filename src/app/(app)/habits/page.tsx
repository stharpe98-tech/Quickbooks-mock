import { ListChecks } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function HabitsPage() {
  return (
    <ComingSoon
      title="Habits"
      description="Daily and weekly habits with streaks."
      section="habits"
      icon={ListChecks}
      features={[
        "Daily and weekly habits with target counts",
        "Tap-to-mark each day, see your streak grow",
        "Heatmap of the last 90 days",
        "Reminders for missed days",
      ]}
    />
  );
}
