import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function JournalPage() {
  return (
    <ComingSoon
      title="Journal"
      description="One entry per day. Your headspace, recorded."
      section="journal"
      icon={BookOpen}
      features={[
        "One entry per day with a markdown editor",
        "Optional 1-5 mood rating",
        "Calendar view of past entries",
        "Search across everything you've written",
      ]}
    />
  );
}
