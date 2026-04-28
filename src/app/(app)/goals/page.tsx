import { Target } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function GoalsPage() {
  return (
    <ComingSoon
      title="Goals"
      description="Long-term targets, tracked over time."
      section="goals"
      icon={Target}
      features={[
        "Numeric goals (save $X, run X miles) and milestone goals",
        "Progress bars with target dates",
        "Mark complete with a celebration",
        "Roll-up of progress on the dashboard",
      ]}
    />
  );
}
