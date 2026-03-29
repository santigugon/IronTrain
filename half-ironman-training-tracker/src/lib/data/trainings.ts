import { addDays, endOfMonth, format, parseISO, startOfMonth } from "date-fns";

import { DISCIPLINE_ORDER } from "@/config/constants";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { TrainingRow } from "./types";

export function groupByDate(rows: TrainingRow[]) {
  const map = new Map<string, TrainingRow[]>();
  for (const r of rows) {
    const list = map.get(r.date) ?? [];
    list.push(r);
    map.set(r.date, list);
  }
  for (const [date, list] of map.entries()) {
    list.sort((a, b) => {
      const ai = DISCIPLINE_ORDER.indexOf(a.discipline as any);
      const bi = DISCIPLINE_ORDER.indexOf(b.discipline as any);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    map.set(date, list);
  }
  return map;
}

export function isDateFullyCompleted(rows: TrainingRow[]) {
  return rows.length > 0 && rows.every((r) => r.completed);
}

export async function fetchTrainingsForDate(dateIso: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("date", dateIso)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TrainingRow[];
}

export async function fetchTrainingsForMonth(anchorDateIso: string) {
  const supabase = getSupabaseClient();
  const anchor = parseISO(anchorDateIso);
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  const startIso = format(start, "yyyy-MM-dd");
  const endIso = format(end, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .gte("date", startIso)
    .lte("date", endIso)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TrainingRow[];
}

export async function toggleTrainingCompleted(
  id: string,
  completed: boolean
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("trainings")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function setAllCompletedForDate(dateIso: string, completed: boolean) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("trainings")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("date", dateIso);
  if (error) throw error;
}

export async function fetchCompletedTrainings() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("completed", true)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrainingRow[];
}

export async function fetchDatesWithTrainingsInRange(
  startIso: string,
  endIso: string
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("date,completed")
    .gte("date", startIso)
    .lte("date", endIso)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Pick<TrainingRow, "date" | "completed">[];
}

export async function computeStreak(todayIso: string) {
  const supabase = getSupabaseClient();
  // Worst-case: ~120 days of plan; fetching 200 days is fine and avoids complex RPC.
  const end = parseISO(todayIso);
  const start = addDays(end, -200);
  const startIso = format(start, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("trainings")
    .select("date,completed")
    .gte("date", startIso)
    .lte("date", todayIso)
    .order("date", { ascending: true });
  if (error) throw error;

  const byDate = new Map<string, boolean[]>();
  for (const row of data ?? []) {
    const list = byDate.get(row.date) ?? [];
    list.push(!!row.completed);
    byDate.set(row.date, list);
  }

  let streak = 0;
  for (let d = todayIso; ; ) {
    const comps = byDate.get(d);
    if (!comps || comps.length === 0) break; // no training day in plan
    const dayComplete = comps.every(Boolean);
    if (!dayComplete) break;
    streak += 1;
    const prev = addDays(parseISO(d), -1);
    d = format(prev, "yyyy-MM-dd");
  }

  return streak;
}

