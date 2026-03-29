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
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load month");
      setMonthRows([]);
      setByDate(new Map());
    }
  }, [month]);

  React.useEffect(() => {
    void refreshMonth();
  }, [refreshMonth]);

  function onPrevMonth() {
    setMonth((m) => addMonths(m, -1));
  }

  function onNextMonth() {
    setMonth((m) => addMonths(m, 1));
  }

  function onMonthPicked(value: string) {
    // value is "YYYY-MM" from <input type="month" />
    const [y, m] = value.split("-").map((v) => Number(v));
    if (!y || !m) return;
    setMonth(new Date(y, m - 1, 1));
  }

  async function openDay(iso: string) {
    setSelectedIso(iso);
    setOpen(true);
    setSelectedRows(null);
    try {
      const rows = await fetchTrainingsForDate(iso);
      setSelectedRows(rows);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load day");
      setSelectedRows([]);
    }
  }

  async function onToggle(id: string, completed: boolean) {
    setSelectedRows((prev) =>
      (prev ?? []).map((t) => (t.id === id ? { ...t, completed } : t))
    );
    setMonthRows((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );

    try {
      await toggleTrainingCompleted(id, completed);
      await refreshMonth();
      if (selectedIso) {
        const rows = await fetchTrainingsForDate(selectedIso);
        setSelectedRows(rows);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
      await refreshMonth();
      if (selectedIso) void openDay(selectedIso);
    }
  }

  async function onMarkAll(completed: boolean) {
    if (!selectedIso) return;
    setSelectedRows((prev) => (prev ?? []).map((t) => ({ ...t, completed })));
    setMonthRows((prev) =>
      prev.map((t) => (t.date === selectedIso ? { ...t, completed } : t))
    );
    try {
      await setAllCompletedForDate(selectedIso, completed);
      await refreshMonth();
      const rows = await fetchTrainingsForDate(selectedIso);
      setSelectedRows(rows);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
      await refreshMonth();
      void openDay(selectedIso);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <PageHeader
        title="Calendar"
        subtitle="Month view (events)"
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/10"
              onClick={onPrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="secondary" className="bg-white/10">
              <CalendarIcon className="mr-1 h-3.5 w-3.5" />
              {format(month, "MMM yyyy")}
            </Badge>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/10"
              onClick={onNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <input
              type="month"
              value={monthInputValue}
              onChange={(e) => onMonthPicked(e.target.value)}
              className="h-9 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground"
              aria-label="Pick month"
            />
          </div>
        }
      />

      <GlassCard className="p-3">
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
            selectedDate={selectedIso ?? monthAnchorIso ?? todayIso}
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

