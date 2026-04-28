import Link from "next/link";
import { format } from "date-fns";
import { Pin, Plus, SearchX, Sparkles, StickyNote, Tag } from "lucide-react";
import { listNotes } from "@/lib/db/notes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

function bodyPreview(body: string, max = 220): string {
  const oneline = body.replace(/\s+/g, " ").trim();
  return oneline.length > max ? oneline.slice(0, max) + "…" : oneline;
}

export default async function NotesPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? "";
  const notes = await listNotes(query);

  return (
    <>
      <PageHeader
        title="Notes"
        description={notes.length === 0 ? "Quick captures, tagged and searchable." : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
        section="notes"
        icon={StickyNote}
        actions={
          <Link href="/notes/new">
            <Button>
              <Plus className="h-4 w-4" />
              New note
            </Button>
          </Link>
        }
      />

      <SearchBar placeholder="Search notes by title or body…" />

      {notes.length === 0 ? (
        <EmptyState
          title={query ? `No notes match "${query}".` : "No notes yet."}
          hint={query ? "Try a different search." : "Capture an idea — markdown is fine."}
          icon={query ? SearchX : Sparkles}
          gradient={query ? undefined : accents.notes.gradient}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((n) => (
            <Card key={n.id} className="relative flex h-full flex-col">
              {n.pinned && (
                <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-100 text-cyan-700">
                  <Pin className="h-3.5 w-3.5" />
                </span>
              )}

              <Link
                href={`/notes/${n.id}`}
                className="block text-base font-semibold text-slate-900 hover:text-cyan-700"
              >
                {n.title || <span className="italic text-slate-500">Untitled</span>}
              </Link>

              <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-wrap text-sm text-slate-600">
                {n.body ? bodyPreview(n.body, 260) : <span className="italic text-slate-400">Empty</span>}
              </p>

              {n.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-200"
                    >
                      <Tag className="h-3 w-3" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-slate-400">
                {format(new Date(n.updated_at), "MMM d, yyyy")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
