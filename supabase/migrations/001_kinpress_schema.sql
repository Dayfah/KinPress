-- KinPress baseline schema + RLS (run in Supabase SQL Editor or via CLI)

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  bio text,
  role text not null default 'reader',
  subscription_status text default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.authors (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  summary text,
  body text not null,
  category_id uuid references public.categories (id) on delete set null,
  category_name text,
  tags text[] default '{}',
  cover_image_url text,
  is_premium boolean not null default false,
  is_featured boolean not null default false,
  status text not null default 'draft',
  published_at timestamptz,
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists public.saved_articles (
  user_id uuid not null references auth.users (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  user_avatar_url text,
  comment_text text not null,
  status text not null default 'visible',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1), 'KinPress reader'),
    'reader'
  )
  on conflict (id) do nothing;

  insert into public.authors (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1), 'KinPress reader')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.saved_articles enable row level security;
alter table public.comments enable row level security;

create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Public read authors" on public.authors for select using (true);

create policy "Public read active categories" on public.categories for select using (is_active = true);

create policy "Public read published articles" on public.articles for select using (status = 'published');
create policy "Editors manage articles" on public.articles for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'editor')
  )
);

create policy "Public read tags" on public.tags for select using (true);
create policy "Public read article_tags" on public.article_tags for select using (true);

create policy "Users manage own saves" on public.saved_articles for all using (auth.uid() = user_id);

create policy "Public read visible comments" on public.comments for select using (status = 'visible');
create policy "Authenticated insert comments" on public.comments for insert with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('article-covers', 'article-covers', true)
on conflict (id) do nothing;
