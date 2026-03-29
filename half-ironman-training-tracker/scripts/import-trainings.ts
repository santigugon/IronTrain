import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

type TrainingInput = {
  date: string;
  day: string;
  discipline: string;
  type: string;
  description: string;
  duration_min: number;
  intensity: string;
  notes: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Default: project root next to package.json (half-ironman-training-tracker/trainings.json)
  const trainingsPath =
    process.env.TRAININGS_JSON_PATH ??
    path.resolve(__dirname, "..", "trainings.json");

  const raw = await fs.readFile(trainingsPath, "utf-8");
  const parsed = JSON.parse(raw) as TrainingInput[];

  const rows = parsed.map((t) => ({
    date: t.date,
    day: t.day,
    discipline: t.discipline,
    type: t.type,
    description: t.description,
    duration_min: t.duration_min,
    intensity: t.intensity,
    notes: t.notes ?? "",
    completed: false,
    completed_at: null,
    effort_rating: null,
    effort_note: null,
  }));

  const { error } = await supabase
    .from("trainings")
    .upsert(rows, { onConflict: "date,discipline,type,description" });

  if (error) throw error;

  console.log(`Imported ${rows.length} trainings from ${trainingsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
