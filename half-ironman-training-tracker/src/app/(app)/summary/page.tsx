"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DISCIPLINE_COLORS, DISCIPLINE_ORDER } from "@/config/constants";
import { fetchCompletedTrainings } from "@/lib/data/trainings";
import type { TrainingRow } from "@/lib/data/types";
import { cn } from "@/lib/utils";

function totalsByDiscipline(rows: TrainingRow[]) {
  const map = new Map<string, { count: number; minutes: number }>();
  for (const r of rows) {
    const cur = map.get(r.discipline) ?? { count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += r.duration_min ?? 0;
    map.set(r.discipline, cur);
  }
  return map;
}

export default function SummaryPage() {
  const [rows, setRows] = React.useState<TrainingRow[] | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await fetchCompletedTrainings();
        setRows(data);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load");
        setRows([]);
      }
    })();
  }, []);

  const totals = React.useMemo(
    () => totalsByDiscipline(rows ?? []),
    [rows]
  );
  const totalMinutes = React.useMemo(
    () => (rows ?? []).reduce((s, r) => s + (r.duration_min ?? 0), 0),
    [rows]
  );

  return (
    <div className="flex flex-1 flex-col gap-3">
      <PageHeader
        title="Summary"
        stacked
        subtitle={
          rows === null
            ? "Loading…"
            : `${rows.length} completed session${rows.length === 1 ? "" : "s"}`
        }
        right={
          <Badge variant="secondary" className="bg-white/10">
            {totalMinutes} min
          </Badge>
        }
      />

      <GlassCard className="p-4">
        <div className="text-sm text-muted-foreground">By discipline</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {DISCIPLINE_ORDER.filter((d) => totals.has(d)).map((d) => {
            const v = totals.get(d)!;
            return (
              <div
                key={d}
                className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      DISCIPLINE_COLORS[d]
                    )}
                  />
                  <div className="text-sm font-medium">{d}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {v.count} sessions • {v.minutes} min
                </div>
              </div>
            );
          })}
          {rows !== null && rows.length === 0 ? (
            <div className="col-span-2 text-sm text-muted-foreground">
              No completed sessions yet.
            </div>
          ) : null}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Recent completed</div>
          <Badge variant="secondary" className="bg-white/10">
            Latest
          </Badge>
        </div>
        <Separator className="my-3 bg-white/10" />
        <div className="flex flex-col gap-3">
          {(rows ?? []).slice(0, 20).map((r) => (
            <div key={r.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1 h-3 w-3 shrink-0 rounded-full",
                  (DISCIPLINE_COLORS as any)[r.discipline] ?? "bg-zinc-400"
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {r.discipline} · {r.type}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.date} · {r.duration_min} min · {r.intensity}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/10">
                    {format(parseISO(r.date), "MMM d")}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {r.description}
                </div>
              </div>
            </div>
          ))}
          {rows !== null && rows.length > 20 ? (
            <div className="text-xs text-muted-foreground">
              Showing the latest 20.
            </div>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}

