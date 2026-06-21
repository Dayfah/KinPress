-- Prevent first-profile inserts from granting elevated roles.
-- Run AFTER 004_production_safe_hardening.sql.

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.role is distinct from 'reader' then
      -- SQL Editor / service role has no JWT; allow manual admin promotion.
      if auth.uid() is not null then
        if not exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        ) then
          raise exception 'Only admins can create profiles with elevated roles';
        end if;
      end if;
    end if;

    return new;
  end if;

  if new.role is distinct from old.role then
    -- SQL Editor / service role has no JWT; allow manual admin promotion.
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
  before insert or update on public.profiles
  for each row execute function public.prevent_profile_role_escalation();
