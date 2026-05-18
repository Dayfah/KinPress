-- KinPress editorial article fields (run after 001_kinpress_schema.sql)

alter table public.articles
  add column if not exists excerpt text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists image_url text,
  add column if not exists editor_pick boolean not null default false,
  add column if not exists reading_time int,
  add column if not exists region text not null default 'national',
  add column if not exists topic text not null default 'culture',
  add column if not exists article_kind text not null default 'kinpress_original';

-- Backfill from existing columns
update public.articles
set
  excerpt = coalesce(nullif(trim(excerpt), ''), nullif(trim(summary), ''), nullif(trim(subtitle), '')),
  image_url = coalesce(nullif(trim(image_url), ''), nullif(trim(cover_image_url), '')),
  reading_time = coalesce(
    reading_time,
    greatest(1, ceil(array_length(regexp_split_to_array(coalesce(body, ''), '\s+'), 1) / 200.0))::int
  )
where excerpt is null or image_url is null or reading_time is null;

-- Restrict article management to admins only
drop policy if exists "Editors manage articles" on public.articles;

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

create index if not exists articles_published_at_idx on public.articles (published_at desc nulls last);
create index if not exists articles_topic_idx on public.articles (topic);
create index if not exists articles_region_idx on public.articles (region);
create index if not exists articles_featured_idx on public.articles (is_featured) where is_featured = true;
create index if not exists articles_editor_pick_idx on public.articles (editor_pick) where editor_pick = true;
