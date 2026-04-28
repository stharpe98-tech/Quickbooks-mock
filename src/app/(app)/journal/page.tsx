import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, ChevronRight, Plus, Sparkles } from "lucide-react";
import { listJournalEntries } from "@/lib/db/journal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

const MOOD_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Awful", color: "bg-rose-500" },
  2: { label: "Bad", color: "bg-orange-500" },
  3: { label: "OK", color: "bg-amber-500" },
  4: { label: "Good", color: "bg-lime-500" },
  5: { label: "Great", color: "bg-emerald-500" },
};

function preview(body: string, max = 220): string {
  const oneline = body.replace(/\s+/g, " ").trim();
  return oneline.length > max ? oneline.slice(0, max) + "…" : oneline;
}

export default async function JournalPage() {
  const entries = await listJournalEntries(60);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <>
      <PageHeader
        title="Journal"
        description={entries.length === 0 ? "One entry per day. Your headspace, recorded." : `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}
        section="journal"
        icon={BookOpen}
        actions={
          <Link href={`/journal/${today}`}>
            <Button>
              <Plus className="h-4 w-4" />
              Today&apos;s entry
            </Button>
          </Link>
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing written yet."
          hint="Start with today — even a sentence."
          icon={Sparkles}
          gradient={accents.journal.gradient}
        />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const mood = e.mood ? MOOD_LABELS[e.mood] : null;
            return (
              <Card key={e.id} className="hover:border-teal-300">
                <Link href={`/journal/${e.date}`} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {format(new Date(e.date), "EEE")}
                    </span>
                    <span className="text-2xl font-bold tabular-nums text-slate-900">
                      {format(new Date(e.date), "d")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(e.date), "MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {mood && (
                      <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        <span className={`block h-2 w-2 rounded-full ${mood.color}`} aria-hidden />
                        {mood.label}
                      </span>
                    )}
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">
                      {preview(e.body, 320) || <span className="italic text-slate-400">Empty</span>}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
