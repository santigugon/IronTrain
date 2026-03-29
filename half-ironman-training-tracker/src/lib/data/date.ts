import { addDays, format, parseISO } from "date-fns";

export function isoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function parseIsoDate(iso: string) {
  return parseISO(iso);
}

export function isoFromParts(year: number, month1: number, day: number) {
  const d = new Date(Date.UTC(year, month1 - 1, day));
  return format(d, "yyyy-MM-dd");
}

export function daysBackInclusive(endIso: string, days: number) {
  const end = parseISO(endIso);
  const start = addDays(end, -(days - 1));
  return { startIso: format(start, "yyyy-MM-dd"), endIso };
}

