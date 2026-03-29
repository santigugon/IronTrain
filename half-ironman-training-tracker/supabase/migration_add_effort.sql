-- Run once in Supabase SQL editor if your `trainings` table predates effort fields.

alter table public.trainings
  add column if not exists effort_rating smallint null;

alter table public.trainings
  add column if not exists effort_note text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainings_effort_rating_range'
  ) then
    alter table public.trainings
      add constraint trainings_effort_rating_range
      check (effort_rating is null or (effort_rating >= 1 and effort_rating <= 5));
  end if;
end $$;
