-- Force comments.created_at from the server clock on insert.
-- Authenticated clients can otherwise supply Postgres-valid but JS-unformattable
-- timestamps (e.g. 'infinity'), which crash public article pages in CommentCard.

create or replace function public.force_comment_created_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists force_comment_created_at on public.comments;
create trigger force_comment_created_at
  before insert on public.comments
  for each row
  execute function public.force_comment_created_at();
