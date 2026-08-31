-- Trigger functions and the search path they run under.

-- An unset search_path lets a caller who can create a schema decide which
-- `now()` or `public` a function body resolves to, so every function here pins
-- one.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- PostgREST exposes every executable function in `public` as an RPC endpoint.
-- These four are reached by their triggers and by nothing else, so the execute
-- grant only opens a way to run them outside the statement they belong to.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.stamp_comment_author() from public, anon, authenticated;
revoke execute on function public.sync_comment_author_name() from public, anon, authenticated;

-- profile_role took any id, which let a signed-in visitor read another
-- account's role through the RPC endpoint. The policy only ever asked about the
-- caller, so the argument goes and auth.uid() is read inside.
drop policy if exists "profiles updatable by owner" on public.profiles;
drop function if exists public.profile_role(uuid);

create or replace function public.profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "profiles updatable by owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.profile_role());

-- is_agent and profile_role are read inside row-level security policies, which
-- are evaluated as the querying role, so both keep execute.
grant execute on function public.is_agent() to anon, authenticated;
grant execute on function public.profile_role() to anon, authenticated;

alter function public.is_agent() set search_path = public, pg_temp;
