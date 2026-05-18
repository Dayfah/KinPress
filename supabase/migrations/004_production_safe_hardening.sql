-- KinPress production hardening (run AFTER 001, 002, kinpress_production_audit_fix, 003)
-- Safe to re-run: uses DROP POLICY IF EXISTS + CREATE POLICY (never CREATE POLICY IF NOT EXISTS).
-- Non-destructive: no DROP TABLE, no column drops, no data deletes.

-- =============================================================================
-- SECTION 1: Helper — keep updated_at accurate on profiles and articles
-- Sets updated_at to now() whenever a row is updated.
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- SECTION 2: Security — prevent users from making themselves admin via profile edit
-- Only existing admins (or service role / SQL editor) can change profiles.role.
-- =============================================================================
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- SQL Editor / service role has no JWT; allow manual admin promotion
    if auth.uid() is not null then
      if not exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      ) then
        raise exception 'Only admins can change profile roles';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_escalation();

-- =============================================================================
-- SECTION 3: Indexes — speed up common app queries (no-op if already exist)
-- =============================================================================
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc nulls last);

create index if not exists articles_slug_idx on public.articles (slug);

create index if not exists saved_articles_user_id_idx
  on public.saved_articles (user_id, created_at desc);

create index if not exists comments_article_id_idx
  on public.comments (article_id, created_at);

create index if not exists profiles_role_idx on public.profiles (role);

-- =============================================================================
-- SECTION 4: RLS — ensure enabled on all public tables used by the app
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.saved_articles enable row level security;
alter table public.comments enable row level security;

-- =============================================================================
-- SECTION 5: profiles
-- Anyone can read profiles (app shows display names on comments).
-- Users may insert/update only their own row; role changes blocked by trigger above.
-- =============================================================================
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles
  for select
  using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =============================================================================
-- SECTION 6: authors
-- Public read; users may insert their own author row (signup fallback).
-- =============================================================================
drop policy if exists "Public read authors" on public.authors;
create policy "Public read authors"
  on public.authors
  for select
  using (true);

drop policy if exists "Users insert own author row" on public.authors;
create policy "Users insert own author row"
  on public.authors
  for insert
  with check (auth.uid() = id);

-- =============================================================================
-- SECTION 7: categories, tags (read-only for clients)
-- =============================================================================
drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories"
  on public.categories
  for select
  using (is_active = true);

drop policy if exists "Public read tags" on public.tags;
create policy "Public read tags"
  on public.tags
  for select
  using (true);

drop policy if exists "Public read article_tags" on public.article_tags;
create policy "Public read article_tags"
  on public.article_tags
  for select
  using (true);

-- =============================================================================
-- SECTION 8: articles
-- Public: published only. Admins: read all + write (insert/update/delete).
-- Split write policy from FOR ALL to avoid overlapping permissive SELECT rules.
-- =============================================================================
drop policy if exists "Editors manage articles" on public.articles;
drop policy if exists "Public read published articles" on public.articles;
create policy "Public read published articles"
  on public.articles
  for select
  using (status = 'published');

drop policy if exists "Admins read all articles" on public.articles;
create policy "Admins read all articles"
  on public.articles
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins manage articles" on public.articles;
drop policy if exists "Admins insert articles" on public.articles;
create policy "Admins insert articles"
  on public.articles
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins update articles" on public.articles;
create policy "Admins update articles"
  on public.articles
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins delete articles" on public.articles;
create policy "Admins delete articles"
  on public.articles
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- =============================================================================
-- SECTION 9: saved_articles — users only see and manage their own saves
-- =============================================================================
drop policy if exists "Users manage own saves" on public.saved_articles;

drop policy if exists "Users read own saves" on public.saved_articles;
create policy "Users read own saves"
  on public.saved_articles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own saves" on public.saved_articles;
create policy "Users insert own saves"
  on public.saved_articles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own saves" on public.saved_articles;
create policy "Users delete own saves"
  on public.saved_articles
  for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- SECTION 10: comments
-- Public reads visible comments; users insert as self on published articles only;
-- users delete their own comments.
-- =============================================================================
drop policy if exists "Public read visible comments" on public.comments;
create policy "Public read visible comments"
  on public.comments
  for select
  using (status = 'visible');

drop policy if exists "Authenticated insert comments" on public.comments;
create policy "Authenticated insert comments"
  on public.comments
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.articles a
      where a.id = article_id
        and a.status = 'published'
    )
  );

drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments"
  on public.comments
  for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- SECTION 11: Storage — article-covers bucket (public read, admin write)
-- Requires storage.objects RLS (enabled by default on Supabase).
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('article-covers', 'article-covers', true)
on conflict (id) do update set public = true;

alter table storage.objects enable row level security;

drop policy if exists "Public read article covers" on storage.objects;
create policy "Public read article covers"
  on storage.objects
  for select
  using (bucket_id = 'article-covers');

drop policy if exists "Admins upload article covers" on storage.objects;
create policy "Admins upload article covers"
  on storage.objects
  for insert
  with check (
    bucket_id = 'article-covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins update article covers" on storage.objects;
create policy "Admins update article covers"
  on storage.objects
  for update
  using (
    bucket_id = 'article-covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'article-covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins delete article covers" on storage.objects;
create policy "Admins delete article covers"
  on storage.objects
  for delete
  using (
    bucket_id = 'article-covers'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- =============================================================================
-- SECTION 12: API grants — PostgREST needs table-level grants; RLS enforces access
-- =============================================================================
grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant select on table public.authors to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.articles to anon, authenticated;
grant select on table public.tags to anon, authenticated;
grant select on table public.article_tags to anon, authenticated;
grant select on table public.comments to anon, authenticated;

grant insert, update on table public.profiles to authenticated;
grant insert on table public.authors to authenticated;
grant insert, delete on table public.saved_articles to authenticated;
grant insert, delete on table public.comments to authenticated;
grant insert, update, delete on table public.articles to authenticated;

-- =============================================================================
-- SECTION 13: Optional CHECK constraints (skip if invalid existing data)
-- =============================================================================
do $$
begin
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('reader', 'admin', 'editor'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.articles
    add constraint articles_status_check
    check (status in ('draft', 'published', 'review', 'archived'));
exception
  when duplicate_object then null;
end $$;
