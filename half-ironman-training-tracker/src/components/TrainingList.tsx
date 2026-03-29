"use client";

import * as React from "react";
import { Check, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DISCIPLINE_COLORS } from "@/config/constants";
import type { TrainingRow } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function TrainingList({
  trainings,
  onToggle,
  onMarkAll,
}: {
  trainings: TrainingRow[];
  onToggle: (id: string, completed: boolean) => void | Promise<void>;
  onMarkAll?: (completed: boolean) => void | Promise<void>;
}) {
  const allCompleted =
    trainings.length > 0 && trainings.every((t) => t.completed);

  return (
    <div className="flex flex-col">
      {onMarkAll ? (
        <div className="flex items-center justify-between pb-2">
          <div className="text-sm text-muted-foreground">
            {trainings.length} session{trainings.length === 1 ? "" : "s"}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMarkAll(!allCompleted)}
          >
            {allCompleted ? "Mark all undone" : "Mark all done"}
          </Button>
        </div>
      ) : null}

      <Separator className="bg-white/10" />

      <div className="flex flex-col divide-y divide-white/10">
        {trainings.map((t) => (
          <div key={t.id} className="flex items-start gap-3 py-3">
            <div
              className={cn(
                "mt-1 h-3 w-3 shrink-0 rounded-full",
                (DISCIPLINE_COLORS as any)[t.discipline] ?? "bg-zinc-400"
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "truncate text-sm font-medium",
                        t.completed && "line-through opacity-70"
                      )}
                    >
                      {t.discipline} · {t.type}
                    </div>
                    {t.completed ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/15 text-emerald-200"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Done
                      </Badge>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 text-sm text-muted-foreground",
                      t.completed && "line-through opacity-70"
                    )}
                  >
                    {t.description}
                  </div>
                </div>
                <Switch
                  checked={t.completed}
                  onCheckedChange={(v) => onToggle(t.id, v)}
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{t.duration_min} min</span>
                <span className="opacity-60">•</span>
                <span className="truncate">{t.intensity}</span>
              </div>
              {t.notes ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.notes}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

