export type TrainingRow = {
  id: string;
  date: string; // YYYY-MM-DD
  day: string;
  discipline: string;
  type: string;
  description: string;
  duration_min: number;
  intensity: string;
  notes: string;
  completed: boolean;
  completed_at: string | null;
  /** 1–5 perceived difficulty when marked done; null if not set or undone */
  effort_rating: number | null;
  effort_note: string | null;
  created_at: string;
};

