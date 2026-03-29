-- Half IronMan training tracker schema
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  day text not null,
  discipline text not null,
  type text not null,
  description text not null,
  duration_min integer not null,
  intensity text not null,
  notes text not null default '',
  completed boolean not null default false,
  completed_at timestamptz null,
  effort_rating smallint null,
  effort_note text null,
  created_at timestamptz not null default now(),
  constraint trainings_effort_rating_range check (
    effort_rating is null or (effort_rating >= 1 and effort_rating <= 5)
  )
);

create index if not exists trainings_date_idx on public.trainings(date);
create index if not exists trainings_completed_date_idx on public.trainings(completed, date);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainings_unique_import'
  ) then
    alter table public.trainings
      add constraint trainings_unique_import
      unique (date, discipline, type, description);
  end if;
end $$;

