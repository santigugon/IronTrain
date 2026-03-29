"use client";

import * as React from "react";
import { addMonths, format, parseISO, startOfMonth } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { EventCalendar } from "@/components/EventCalendar";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { TrainingList } from "@/components/TrainingList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isoDate } from "@/lib/data/date";
import {
  fetchTrainingsForDate,
  fetchTrainingsForMonth,
  groupByDate,
  setAllCompletedForDate,
  toggleTrainingCompleted,
  type TrainingCompletionEffort,
} from "@/lib/data/trainings";
import type { TrainingRow } from "@/lib/data/types";

export default function CalendarPage() {
  const todayIso = React.useMemo(() => isoDate(new Date()), []);
  const [month, setMonth] = React.useState<Date>(() => new Date());
  const [monthRows, setMonthRows] = React.useState<TrainingRow[]>([]);
  const [byDate, setByDate] = React.useState<Map<string, TrainingRow[]>>(
    () => new Map()
  );

  const [open, setOpen] = React.useState(false);
  const [selectedIso, setSelectedIso] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<TrainingRow[] | null>(
    null
  );

  const monthInputValue = React.useMemo(() => format(month, "yyyy-MM"), [month]);
  const monthAnchorIso = React.useMemo(
    () => format(startOfMonth(month), "yyyy-MM-dd"),
    [month]
  );

  const refreshMonth = React.useCallback(async () => {
    try {
      const anchorIso = format(month, "yyyy-MM-dd");
      const rows = await fetchTrainingsForMonth(anchorIso);
      setMonthRows(rows);
      const grouped = groupByDate(rows);
      setByDate(grouped);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load month");
      setMonthRows([]);
      setByDate(new Map());
    }
  }, [month]);

  React.useEffect(() => {
    void refreshMonth();
  }, [refreshMonth]);

  function onPrevMonth() {
    setOpen(false);
    setSelectedIso(null);
    setMonth((m) => addMonths(m, -1));
  }

  function onNextMonth() {
    setOpen(false);
    setSelectedIso(null);
    setMonth((m) => addMonths(m, 1));
  }

  function onMonthPicked(value: string) {
    // value is "YYYY-MM" from <input type="month" />
    const [y, m] = value.split("-").map((v) => Number(v));
    if (!y || !m) return;
    setOpen(false);
    setSelectedIso(null);
    setMonth(new Date(y, m - 1, 1));
  }

  async function openDay(iso: string) {
    setSelectedIso(iso);
    setOpen(true);
    setSelectedRows(null);
    try {
      const rows = await fetchTrainingsForDate(iso);
      setSelectedRows(rows);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load day");
      setSelectedRows([]);
    }
  }

  async function onToggle(
    id: string,
    completed: boolean,
    effort?: TrainingCompletionEffort
  ) {
    setSelectedRows((prev) =>
      (prev ?? []).map((t) =>
        t.id === id
          ? {
              ...t,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
              effort_rating:
                completed && effort ? effort.rating : null,
              effort_note:
                completed && effort
                  ? effort.note.trim() || null
                  : null,
            }
          : t
      )
    );
    setMonthRows((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
              effort_rating:
                completed && effort ? effort.rating : null,
              effort_note:
                completed && effort
                  ? effort.note.trim() || null
                  : null,
            }
          : t
      )
    );

    try {
      await toggleTrainingCompleted(id, completed, effort);
      await refreshMonth();
      if (selectedIso) {
        const rows = await fetchTrainingsForDate(selectedIso);
        setSelectedRows(rows);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
      await refreshMonth();
      if (selectedIso) void openDay(selectedIso);
      throw e;
    }
  }

  async function onMarkAll(completed: boolean) {
    if (!selectedIso) return;
    setSelectedRows((prev) =>
      (prev ?? []).map((t) => ({
        ...t,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        effort_rating: null,
        effort_note: null,
      }))
    );
    setMonthRows((prev) =>
      prev.map((t) =>
        t.date === selectedIso
          ? {
              ...t,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
              effort_rating: null,
              effort_note: null,
            }
          : t
      )
    );
    try {
      await setAllCompletedForDate(selectedIso, completed);
      await refreshMonth();
      const rows = await fetchTrainingsForDate(selectedIso);
      setSelectedRows(rows);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
      await refreshMonth();
      void openDay(selectedIso);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <PageHeader
        title="Calendar"
        subtitle="Month view (events)"
        stacked
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-11 min-h-11 w-11 min-w-11 shrink-0 bg-white/10"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="!size-6" />
        </Button>
        <Badge variant="secondary" className="bg-white/10 px-2 py-1.5 text-sm">
          <CalendarIcon className="mr-1 size-4" />
          {format(month, "MMM yyyy")}
        </Badge>
        <Button
          variant="secondary"
          size="icon"
          className="h-11 min-h-11 w-11 min-w-11 shrink-0 bg-white/10"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="!size-6" />
        </Button>
        <input
          type="month"
          value={monthInputValue}
          onChange={(e) => onMonthPicked(e.target.value)}
          className="h-11 min-h-11 min-w-[9.5rem] rounded-md border border-white/10 bg-white/5 px-3 text-sm text-foreground"
          aria-label="Pick month"
        />
      </div>

      <GlassCard className="w-full min-w-0 p-3">
        {monthRows.length === 0 ? (
          <div className="flex flex-col gap-2 p-3">
            <div className="text-sm font-medium">No trainings loaded</div>
            <div className="text-sm text-muted-foreground">
              This calendar reads from Supabase. If you haven’t imported
              `trainings.json` yet, the month will look empty.
            </div>
            <div className="text-xs text-muted-foreground">
              Run the SQL in `supabase/schema.sql`, then run `npm run import:trainings`
              (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`).
            </div>
          </div>
        ) : (
          <EventCalendar
            selectedDate={monthAnchorIso}
            trainings={monthRows}
            onSelectDate={(iso) => void openDay(iso)}
          />
        )}
      </GlassCard>

      <GlassCard className="p-4">
        <div className="text-sm text-muted-foreground">
          This month: {byDate.size} planned day{byDate.size === 1 ? "" : "s"}
        </div>
      </GlassCard>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="glass border-white/10">
          <SheetHeader>
            <SheetTitle>
              {selectedIso ? format(parseISO(selectedIso), "EEEE · MMM d") : "Day"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {selectedRows === null ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : selectedRows.length === 0 ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  No sessions planned.
                </div>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <GlassCard className="p-4">
                <TrainingList
                  trainings={selectedRows}
                  onToggle={onToggle}
                  onMarkAll={onMarkAll}
                />
              </GlassCard>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

