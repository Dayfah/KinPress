-- Force public comment attribution from the caller's profile.
-- Authenticated clients can INSERT into comments with arbitrary user_name /
-- user_avatar_url under the existing RLS check (auth.uid() = user_id). The
-- article page renders those denormalized fields, so a direct Data API insert
-- could impersonate editors/admins or plant an unrelated avatar URL.
--
-- Idempotent: safe to re-run in the Supabase SQL Editor.

create or replace function public.force_comment_attribution_from_profile()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  resolved_name text;
  resolved_avatar text;
begin
  select
    coalesce(
      nullif(trim(p.display_name), ''),
      nullif(trim(p.username), ''),
      'KinPress reader'
    ),
    p.avatar_url
  into resolved_name, resolved_avatar
  from public.profiles p
  where p.id = new.user_id;

  new.user_name := coalesce(resolved_name, 'KinPress reader');
  new.user_avatar_url := resolved_avatar;

  return new;
end;
$$;

drop trigger if exists force_comment_attribution_from_profile on public.comments;
create trigger force_comment_attribution_from_profile
  before insert or update on public.comments
  for each row execute function public.force_comment_attribution_from_profile();
