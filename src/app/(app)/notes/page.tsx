import { StickyNote } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function NotesPage() {
  return (
    <ComingSoon
      title="Notes"
      description="Quick captures, tagged and searchable."
      section="notes"
      icon={StickyNote}
      features={[
        "Markdown-friendly note editor",
        "Tags + full-text search",
        "Pin important notes to the top",
        "Archive when you're done with them",
      ]}
    />
  );
}
