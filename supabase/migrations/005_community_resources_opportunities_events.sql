-- KinPress community resources, opportunities, events, preferences, and ingestion logs.
-- Run AFTER 004_production_safe_hardening.sql.
-- Safe to re-run: all policies are dropped before creation; no CREATE POLICY IF NOT EXISTS.

create extension if not exists "pgcrypto";

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  description text not null,
  category text not null default 'community',
  location text,
  region text not null default 'national',
  eligibility text,
  deadline date,
  cost text,
  format text,
  source_url text not null unique,
  date_verified date,
  tags text[] not null default '{}',
  is_verified boolean not null default false,
  status text not null default 'published',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  description text not null,
  category text not null default 'career',
  deadline date,
  eligibility text,
  amount text,
  location text,
  region text not null default 'national',
  source_url text not null unique,
  date_verified date,
  tags text[] not null default '{}',
  is_verified boolean not null default false,
  status text not null default 'published',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text,
  description text not null,
  category text not null default 'community',
  location text,
  region text not null default 'local',
  starts_at timestamptz,
  ends_at timestamptz,
  source_url text not null unique,
  image_url text,
  price text,
  tags text[] not null default '{}',
  is_verified boolean not null default false,
  status text not null default 'published',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  topics text[] not null default '{}',
  regions text[] not null default '{}',
  resource_categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  status text not null default 'started',
  items_seen int not null default 0,
  items_upserted int not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

update public.articles a
set category_id = c.id
from public.categories c
where a.category_id is null
  and lower(regexp_replace(coalesce(a.category_name, ''), '[^a-z0-9]+', '-', 'g')) = c.slug;

do $$
begin
  alter table public.resources
    add constraint resources_status_check
    check (status in ('draft', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.opportunities
    add constraint opportunities_status_check
    check (status in ('draft', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.events
    add constraint events_status_check
    check (status in ('draft', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create index if not exists resources_public_idx
  on public.resources (status, is_verified, category, deadline);
create index if not exists resources_region_idx on public.resources (region);
create index if not exists resources_created_by_idx on public.resources (created_by);

create index if not exists opportunities_public_idx
  on public.opportunities (status, is_verified, category, deadline);
create index if not exists opportunities_region_idx on public.opportunities (region);
create index if not exists opportunities_created_by_idx on public.opportunities (created_by);

create index if not exists events_public_idx
  on public.events (status, is_verified, starts_at);
create index if not exists events_region_idx on public.events (region);
create index if not exists events_created_by_idx on public.events (created_by);

alter table public.resources enable row level security;
alter table public.opportunities enable row level security;
alter table public.events enable row level security;
alter table public.user_preferences enable row level security;
alter table public.ingestion_runs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.resources to anon, authenticated;
grant select on table public.opportunities to anon, authenticated;
grant select on table public.events to anon, authenticated;
grant select, insert, update on table public.user_preferences to authenticated;
grant insert, update, delete on table public.resources to authenticated;
grant insert, update, delete on table public.opportunities to authenticated;
grant insert, update, delete on table public.events to authenticated;
grant select on table public.ingestion_runs to authenticated;

drop policy if exists "Public read verified resources" on public.resources;
create policy "Public read verified resources"
  on public.resources
  for select
  using (status = 'published' and is_verified = true);

drop policy if exists "Editors manage resources" on public.resources;
create policy "Editors manage resources"
  on public.resources
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'editor')
    )
  );

drop policy if exists "Public read verified opportunities" on public.opportunities;
create policy "Public read verified opportunities"
  on public.opportunities
  for select
  using (status = 'published' and is_verified = true);

drop policy if exists "Editors manage opportunities" on public.opportunities;
create policy "Editors manage opportunities"
  on public.opportunities
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'editor')
    )
  );

drop policy if exists "Public read verified events" on public.events;
create policy "Public read verified events"
  on public.events
  for select
  using (status = 'published' and is_verified = true);

drop policy if exists "Editors manage events" on public.events;
create policy "Editors manage events"
  on public.events
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'editor')
    )
  );

drop policy if exists "Users read own preferences" on public.user_preferences;
create policy "Users read own preferences"
  on public.user_preferences
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own preferences" on public.user_preferences;
create policy "Users insert own preferences"
  on public.user_preferences
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own preferences" on public.user_preferences;
create policy "Users update own preferences"
  on public.user_preferences
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Admins read ingestion runs" on public.ingestion_runs;
create policy "Admins read ingestion runs"
  on public.ingestion_runs
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
