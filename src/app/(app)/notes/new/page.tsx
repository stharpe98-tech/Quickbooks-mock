import { StickyNote } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { NoteForm } from "./NoteForm";

export default function NewNotePage() {
  return (
    <>
      <PageHeader title="New note" description="Quick capture — markdown OK." section="notes" icon={StickyNote} />
      <Card>
        <NoteForm />
      </Card>
    </>
  );
}
