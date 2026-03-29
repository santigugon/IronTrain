"use client";

import * as React from "react";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";

import { DISCIPLINE_COLORS, type Discipline } from "@/config/constants";
import type { TrainingRow } from "@/lib/data/types";
import { Temporal } from "@/lib/temporal";

function toScheduleXColors(twBgClass: string) {
  // Event "container" is the background behind the title.
  // For better contrast with WHITE text, use a darker/stronger container color.
  switch (twBgClass) {
    case "bg-sky-400":
      return {
        light: { main: "hsl(199 89% 45%)", container: "hsl(199 89% 45% / 0.85)", onContainer: "hsl(0 0% 98%)" },
        dark: { main: "hsl(199 89% 70%)", container: "hsl(199 89% 70% / 0.35)", onContainer: "hsl(0 0% 98%)" },
      };
    case "bg-amber-400":
      return {
        light: { main: "hsl(43 96% 40%)", container: "hsl(43 96% 40% / 0.85)", onContainer: "hsl(0 0% 98%)" },
        dark: { main: "hsl(43 96% 56%)", container: "hsl(43 96% 56% / 0.35)", onContainer: "hsl(0 0% 98%)" },
      };
    case "bg-rose-400":
      return {
        light: { main: "hsl(351 83% 45%)", container: "hsl(351 83% 45% / 0.85)", onContainer: "hsl(0 0% 98%)" },
        dark: { main: "hsl(351 83% 68%)", container: "hsl(351 83% 68% / 0.35)", onContainer: "hsl(0 0% 98%)" },
      };
    case "bg-violet-400":
      return {
        light: { main: "hsl(262 83% 45%)", container: "hsl(262 83% 45% / 0.85)", onContainer: "hsl(0 0% 98%)" },
        dark: { main: "hsl(262 83% 72%)", container: "hsl(262 83% 72% / 0.35)", onContainer: "hsl(0 0% 98%)" },
      };
    case "bg-emerald-400":
      return {
        light: { main: "hsl(160 84% 32%)", container: "hsl(160 84% 32% / 0.85)", onContainer: "hsl(0 0% 98%)" },
        dark: { main: "hsl(160 84% 45%)", container: "hsl(160 84% 45% / 0.35)", onContainer: "hsl(0 0% 98%)" },
      };
    default:
      return {
        light: { main: "hsl(240 5% 35%)", container: "hsl(240 5% 35% / 0.8)", onContainer: "hsl(0 0% 98%)" },
        dark: { main: "hsl(240 5% 65%)", container: "hsl(240 5% 65% / 0.35)", onContainer: "hsl(0 0% 98%)" },
      };
  }
}

function disciplineCalendarDef(d: Discipline) {
  const tw = DISCIPLINE_COLORS[d];
  const c = toScheduleXColors(tw);
  return {
    label: d,
    colorName: d.toLowerCase(),
    lightColors: c.light,
    darkColors: c.dark,
  };
}

export function EventCalendar({
  selectedDate,
  trainings,
  onSelectDate,
}: {
  selectedDate: string; // YYYY-MM-DD
  trainings: TrainingRow[];
  onSelectDate?: (iso: string) => void;
}) {
  const calendars = React.useMemo(
    () => ({
      swim: disciplineCalendarDef("Swim"),
      bike: disciplineCalendarDef("Bike"),
      run: disciplineCalendarDef("Run"),
      gym: disciplineCalendarDef("Gym"),
      rest: disciplineCalendarDef("Rest"),
      race: disciplineCalendarDef("Race"),
    }),
    []
  );

  const events = React.useMemo(() => {
    return trainings.map((t) => ({
      id: t.id,
      title: `${t.discipline}: ${t.description}`,
      start: Temporal.PlainDate.from(t.date),
      end: Temporal.PlainDate.from(t.date),
      calendarId: String(t.discipline).toLowerCase(),
      _options: t.completed
        ? {
            additionalClasses: ["sx-event-completed"],
          }
        : undefined,
    }));
  }, [trainings]);

  const selectedTemporalDate = React.useMemo(
    () => Temporal.PlainDate.from(selectedDate),
    [selectedDate]
  );

  const calendarApp = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewMonthAgenda(), createViewWeek(), createViewDay()],
    theme: "shadcn",
    selectedDate: selectedTemporalDate,
    calendars,
    events,
    callbacks: onSelectDate
      ? {
          onClickDate: (d: unknown) => {
            const iso =
              typeof d === "string"
                ? d
                : d && typeof d === "object" && "toString" in d
                  ? String((d as { toString: () => string }).toString())
                  : "";
            if (iso) onSelectDate(iso);
          },
        }
      : undefined,
  });

  return (
    <div className="sx-react-calendar-wrapper">
      <ScheduleXCalendar calendarApp={calendarApp} />
    </div>
  );
}

