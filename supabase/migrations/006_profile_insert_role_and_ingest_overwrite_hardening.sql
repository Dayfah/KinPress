-- Prevent client-side role escalation when bootstrapping missing profile rows.
-- Keep normal app/bootstrap inserts working by allowing only the default reader role.
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id and role = 'reader');
