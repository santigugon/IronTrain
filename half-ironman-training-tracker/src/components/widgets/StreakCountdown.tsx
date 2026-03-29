"use client";

import * as React from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Flame, Hourglass } from "lucide-react";

import { GlassCard } from "@/components/GlassCard";
import { RACE_DATE } from "@/config/constants";

export function StreakCountdown({
  streak,
  todayIso,
}: {
  streak: number;
  todayIso: string;
}) {
  const today = parseISO(todayIso);
  const race = parseISO(RACE_DATE);
  const days = differenceInCalendarDays(race, today);

  return (
    <div className="grid grid-cols-2 gap-3">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Streak</div>
          <Flame className="h-4 w-4 text-amber-300" />
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">
          {streak}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">days</div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Countdown</div>
          <Hourglass className="h-4 w-4 text-sky-300" />
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">
          {days}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          days to {format(race, "MMM d")}
        </div>
      </GlassCard>
    </div>
  );
}

