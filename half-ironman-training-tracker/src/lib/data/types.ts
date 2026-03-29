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
  created_at: string;
};

