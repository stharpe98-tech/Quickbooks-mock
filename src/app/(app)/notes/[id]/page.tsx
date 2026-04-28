import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, StickyNote } from "lucide-react";
import { getNote } from "@/lib/db/notes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditNoteForm } from "./EditNoteForm";
import { PinToggleButton } from "./PinToggleButton";
import { DeleteNoteButton } from "./DeleteNoteButton";

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id);
  if (!note) notFound();

  return (
    <>
      <PageHeader
        title={note.title || "Untitled"}
        description={`Last edited ${format(new Date(note.updated_at), "MMM d, yyyy")}`}
        section="notes"
        icon={StickyNote}
        actions={
          <>
            <Link href="/notes">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <PinToggleButton id={note.id} pinned={note.pinned} />
          </>
        }
      />

      <Card>
        <EditNoteForm
          id={note.id}
          initial={{
            title: note.title ?? "",
            body: note.body,
            tags: note.tags.join(", "),
          }}
        />
        <div className="mt-6 border-t border-slate-200 pt-4">
          <DeleteNoteButton id={note.id} title={note.title ?? "this note"} />
        </div>
      </Card>
    </>
  );
}
