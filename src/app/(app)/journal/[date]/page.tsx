import Link from "next/link";
import { format, addDays, subDays } from "date-fns";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { getJournalByDate } from "@/lib/db/journal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { JournalForm } from "./JournalForm";
import { DeleteJournalButton } from "./DeleteJournalButton";

export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function JournalDayPage({ params }: { params: { date: string } }) {
  if (!ISO_DATE.test(params.date)) {
    return (
      <Card>
        <p className="text-sm text-slate-700">Invalid date.</p>
      </Card>
    );
  }

  const entry = await getJournalByDate(params.date);
  const date = new Date(`${params.date}T00:00:00`);
  const prev = format(subDays(date, 1), "yyyy-MM-dd");
  const next = format(addDays(date, 1), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <>
      <PageHeader
        title={format(date, "EEEE, MMMM d, yyyy")}
        description={params.date === today ? "Today" : undefined}
        section="journal"
        icon={BookOpen}
        actions={
          <>
            <Link href="/journal">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                All entries
              </Button>
            </Link>
            <div className="flex gap-1">
              <Link href={`/journal/${prev}`}>
                <Button variant="secondary" size="sm" aria-label="Previous day">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/journal/${next}`}>
                <Button variant="secondary" size="sm" aria-label="Next day">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        }
      />

      <Card>
        <JournalForm
          date={params.date}
          initial={{
            body: entry?.body ?? "",
            mood: entry?.mood ?? null,
          }}
        />
        {entry && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <DeleteJournalButton id={entry.id} date={params.date} />
          </div>
        )}
      </Card>
    </>
  );
}
