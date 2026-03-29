export const RACE_DATE = "2026-07-15";

export type Discipline = "Swim" | "Bike" | "Run" | "Gym" | "Rest" | "Race";

export const DISCIPLINE_ORDER: Discipline[] = [
  "Swim",
  "Bike",
  "Run",
  "Gym",
  "Rest",
  "Race",
];

export const DISCIPLINE_COLORS: Record<Discipline, string> = {
  Swim: "bg-sky-400",
  Bike: "bg-amber-400",
  Run: "bg-rose-400",
  Gym: "bg-violet-400",
  Rest: "bg-zinc-400",
  Race: "bg-emerald-400",
};

