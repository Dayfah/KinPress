-- KinPress app alignment (run after 001, 002, kinpress_production_audit_fix)
-- Idempotent: safe to re-run. No CREATE POLICY IF NOT EXISTS.

-- ---------------------------------------------------------------------------
-- authors: app calls ensureAuthorRow() from authenticated server/client context
-- ---------------------------------------------------------------------------
drop policy if exists "Users insert own author row" on public.authors;
create policy "Users insert own author row"
  on public.authors
  for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- comments: only on published articles
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
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

-- ---------------------------------------------------------------------------
-- optional constraints (skip if violates existing rows)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- API role grants (Supabase Data API)
-- ---------------------------------------------------------------------------
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
grant select, insert, delete on table public.saved_articles to authenticated;
grant insert, delete on table public.comments to authenticated;

-- articles write handled by RLS admin policy; grants still required for PostgREST
grant insert, update, delete on table public.articles to authenticated;

-- ---------------------------------------------------------------------------
-- storage RLS (bucket from 001)
-- ---------------------------------------------------------------------------
alter table storage.objects enable row level security;
