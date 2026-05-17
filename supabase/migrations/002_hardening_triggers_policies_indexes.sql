-- KinPress hardening migration (non-destructive)
-- Adds updated_at triggers, helper role function, explicit saved_articles policies,
-- and performance indexes expected by current app queries.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- updated_at triggers

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

-- admin/editor helper
create or replace function public.is_admin_or_editor(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role in ('admin', 'editor')
  );
$$;

-- tighten article manager policy to include with check (non-destructive: replace existing)
drop policy if exists "Editors manage articles" on public.articles;
create policy "Editors manage articles" on public.articles
for all
using (public.is_admin_or_editor(auth.uid()))
with check (public.is_admin_or_editor(auth.uid()));

-- explicit saved_articles policies to avoid relying on FOR ALL semantics only
create policy if not exists "Users read own saves" on public.saved_articles
for select
using (auth.uid() = user_id);

create policy if not exists "Users insert own saves" on public.saved_articles
for insert
with check (auth.uid() = user_id);

create policy if not exists "Users delete own saves" on public.saved_articles
for delete
using (auth.uid() = user_id);

-- indexes for query patterns in app
create index if not exists idx_articles_status_published_at
  on public.articles (status, published_at desc);

create index if not exists idx_articles_category_status_published_at
  on public.articles (category_id, status, published_at desc);

create index if not exists idx_saved_articles_user_created_at
  on public.saved_articles (user_id, created_at desc);

create index if not exists idx_comments_article_status_created_at
  on public.comments (article_id, status, created_at asc);
