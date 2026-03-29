"use client";

import * as React from "react";
import { Check, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DISCIPLINE_COLORS } from "@/config/constants";
import type { TrainingCompletionEffort } from "@/lib/data/trainings";
import type { TrainingRow } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const disciplineDotClass = (discipline: string) =>
  (DISCIPLINE_COLORS as Record<string, string>)[discipline] ?? "bg-zinc-400";

export function TrainingList({
  trainings,
  onToggle,
  onMarkAll,
}: {
  trainings: TrainingRow[];
  onToggle: (
    id: string,
    completed: boolean,
    effort?: TrainingCompletionEffort
  ) => void | Promise<void>;
  onMarkAll?: (completed: boolean) => void | Promise<void>;
}) {
  const allCompleted =
    trainings.length > 0 && trainings.every((t) => t.completed);

  const [effortTargetId, setEffortTargetId] = React.useState<string | null>(
    null
  );
  const [effortRating, setEffortRating] = React.useState<number>(3);
  const [effortNote, setEffortNote] = React.useState("");

  const effortTarget = React.useMemo(
    () => trainings.find((t) => t.id === effortTargetId) ?? null,
    [trainings, effortTargetId]
  );

  function openEffortDialog(id: string) {
    setEffortTargetId(id);
    setEffortRating(3);
    setEffortNote("");
  }

  function closeEffortDialog() {
    setEffortTargetId(null);
  }

  async function confirmEffort() {
    if (!effortTargetId) return;
    try {
      await onToggle(effortTargetId, true, {
        rating: effortRating,
        note: effortNote,
      });
      closeEffortDialog();
    } catch {
      /* parent shows toast and refreshes */
    }
  }

  function onSwitchChange(id: string, next: boolean) {
    if (next) {
      openEffortDialog(id);
      return;
    }
    void onToggle(id, false);
  }

  return (
    <div className="flex flex-col">
      <Dialog
        open={effortTargetId !== null}
        onOpenChange={(open) => {
          if (!open) closeEffortDialog();
        }}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>¿Cómo te fue?</DialogTitle>
            <DialogDescription>
              Elige del 1 al 5 qué tan dura te resultó la sesión. Opcional:
              apunta qué te costó y por qué.
            </DialogDescription>
          </DialogHeader>

          {effortTarget ? (
            <p className="text-sm font-medium text-foreground">
              {effortTarget.discipline} · {effortTarget.type}
            </p>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Dificultad (1 = muy fácil, 5 = muy duro)
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dificultad">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={effortRating === n ? "default" : "secondary"}
                  className={cn(
                    "min-w-10",
                    effortRating === n && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => setEffortRating(n)}
                  aria-pressed={effortRating === n}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="effort-note"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Nota (opcional)
            </label>
            <textarea
              id="effort-note"
              value={effortNote}
              onChange={(e) => setEffortNote(e.target.value)}
              rows={3}
              placeholder="¿Qué te costó y por qué?"
              className="w-full resize-y rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="secondary" type="button" />}>
              Cancelar
            </DialogClose>
            <Button type="button" onClick={() => void confirmEffort()}>
              Marcar hecho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                disciplineDotClass(t.discipline)
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
                        className="border-black bg-emerald-500/75 text-black [&_svg]:text-black"
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
                  {t.completed &&
                  t.effort_rating != null &&
                  Number.isFinite(t.effort_rating) ? (
                    <div className="mt-2 space-y-1 rounded-lg bg-white/5 px-2 py-1.5 text-xs text-muted-foreground ring-1 ring-white/10">
                      <div>
                        Dificultad:{" "}
                        <span className="font-medium text-foreground">
                          {t.effort_rating}/5
                        </span>
                      </div>
                      {t.effort_note ? (
                        <div className="text-muted-foreground">
                          {t.effort_note}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <Switch
                  checked={t.completed}
                  onCheckedChange={(v) => onSwitchChange(t.id, v)}
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
