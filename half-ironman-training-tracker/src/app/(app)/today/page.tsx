"use client";

import * as React from "react";
import { addDays, format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { TrainingList } from "@/components/TrainingList";
import { StreakCountdown } from "@/components/widgets/StreakCountdown";
import { isoDate } from "@/lib/data/date";
import {
  computeStreak,
  fetchTrainingsForDate,
  setAllCompletedForDate,
  toggleTrainingCompleted,
} from "@/lib/data/trainings";
import type { TrainingRow } from "@/lib/data/types";

export default function TodayPage() {
  const todayIso = React.useMemo(() => isoDate(new Date()), []);
  const [dayIso, setDayIso] = React.useState<string>(() => todayIso);
  const [trainings, setTrainings] = React.useState<TrainingRow[] | null>(null);
  const [streak, setStreak] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        fetchTrainingsForDate(dayIso),
        computeStreak(todayIso),
      ]);
      setTrainings(t);
      setStreak(s);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
      setTrainings([]);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  }, [dayIso, todayIso]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const minutesToday = React.useMemo(() => {
    if (!trainings) return 0;
    return trainings.reduce((sum, t) => sum + (t.duration_min ?? 0), 0);
  }, [trainings]);

  async function onToggle(id: string, completed: boolean) {
    if (!trainings) return;
    setTrainings((prev) =>
      (prev ?? []).map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await toggleTrainingCompleted(id, completed);
      const s = await computeStreak(todayIso);
      setStreak(s);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
      await refresh();
    }
  }

  async function onMarkAll(completed: boolean) {
    if (!trainings) return;
    setTrainings((prev) => (prev ?? []).map((t) => ({ ...t, completed })));
    try {
      await setAllCompletedForDate(dayIso, completed);
      const s = await computeStreak(todayIso);
      setStreak(s);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
      await refresh();
    }
  }

  function onPrevDay() {
    setDayIso((iso) => isoDate(addDays(parseISO(iso), -1)));
  }

  function onNextDay() {
    setDayIso((iso) => isoDate(addDays(parseISO(iso), 1)));
  }

  function onPickDay(value: string) {
    // value is "YYYY-MM-DD" from <input type="date" />
    if (!value) return;
    setDayIso(value);
  }

  const subtitle = format(parseISO(dayIso), "EEEE · MMM d, yyyy");

  return (
    <div className="flex flex-1 flex-col gap-3">
      <PageHeader
        title="Day"
        subtitle={subtitle}
        right={
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl bg-white/10 px-2 py-2 text-xs text-muted-foreground hover:bg-white/15"
              onClick={onPrevDay}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="rounded-xl bg-white/10 px-3 py-2 text-xs text-muted-foreground hover:bg-white/15"
              onClick={() => setDayIso(todayIso)}
            >
              Today
            </button>
            <button
              className="rounded-xl bg-white/10 px-2 py-2 text-xs text-muted-foreground hover:bg-white/15"
              onClick={onNextDay}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={dayIso}
              onChange={(e) => onPickDay(e.target.value)}
              className="h-9 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground"
              aria-label="Pick day"
            />
          </div>
        }
      />

      <StreakCountdown streak={streak} todayIso={todayIso} />

      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Planned</div>
            <div className="mt-1 text-lg font-semibold">{minutesToday} min</div>
          </div>
          <button
            className="rounded-xl bg-white/10 px-3 py-2 text-xs text-muted-foreground hover:bg-white/15"
            onClick={() => void refresh()}
          >
            Refresh
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : trainings && trainings.length > 0 ? (
          <TrainingList
            trainings={trainings}
            onToggle={onToggle}
            onMarkAll={onMarkAll}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            No sessions planned for today.
          </div>
        )}
      </GlassCard>
    </div>
  );
}

