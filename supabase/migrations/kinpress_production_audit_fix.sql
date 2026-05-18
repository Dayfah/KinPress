-- KinPress production audit fix (safe to re-run)
-- Run in Supabase SQL Editor after 001 + 002 migrations.

-- ---------------------------------------------------------------------------
-- saved_articles: explicit per-operation policies
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- articles: public reads published; admins manage all rows
-- ---------------------------------------------------------------------------
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
create policy "Admins manage articles"
  on public.articles
  for all
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

-- ---------------------------------------------------------------------------
-- profiles: owner-only writes
-- ---------------------------------------------------------------------------
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- comments: visible read; authenticated insert as self
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated insert comments" on public.comments;
create policy "Authenticated insert comments"
  on public.comments
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments"
  on public.comments
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- storage: public read for article covers; admins upload
-- (Skip if your project disallows storage policy DDL from SQL editor.)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('article-covers', 'article-covers', true)
on conflict (id) do update set public = true;

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
