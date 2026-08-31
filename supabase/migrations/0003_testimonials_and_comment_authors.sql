-- Comment authorship, agent-managed testimonials, lead triage fields.

create or replace function public.profile_role(uid uuid)
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = uid;
$$;

-- The original policy read public.profiles from inside a policy on
-- public.profiles, which Postgres rejects as recursive. The role check now goes
-- through a security definer function, which is exempt.
drop policy if exists "profiles updatable by owner" on public.profiles;

create policy "profiles updatable by owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.profile_role(auth.uid()));

-- A member cannot select another member's profile row, so a joined author name
-- came back null for every reader but the author. The name and role are copied
-- onto the comment at insert and kept in step by a trigger on the profile.
alter table public.comments
  add column if not exists author_name text,
  add column if not exists author_role public.user_role not null default 'member';

create or replace function public.stamp_comment_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select coalesce(nullif(trim(p.full_name), ''), 'Member'), p.role
    into new.author_name, new.author_role
  from public.profiles p
  where p.id = new.author_id;

  new.author_name := coalesce(new.author_name, 'Member');
  new.author_role := coalesce(new.author_role, 'member');
  return new;
end;
$$;

drop trigger if exists comments_stamp_author on public.comments;
create trigger comments_stamp_author
  before insert on public.comments
  for each row execute function public.stamp_comment_author();

create or replace function public.sync_comment_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.full_name is distinct from old.full_name or new.role is distinct from old.role then
    update public.comments
      set author_name = coalesce(nullif(trim(new.full_name), ''), 'Member'),
          author_role = new.role
      where author_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_comment_author on public.profiles;
create trigger profiles_sync_comment_author
  after update on public.profiles
  for each row execute function public.sync_comment_author_name();

update public.comments c
  set author_name = coalesce(nullif(trim(p.full_name), ''), 'Member'),
      author_role = p.role
from public.profiles p
where p.id = c.author_id and c.author_name is null;

create index if not exists comments_parent_idx on public.comments (parent_id);

alter table public.leads
  add column if not exists handled_at timestamptz,
  add column if not exists agent_notes text;

create index if not exists leads_handled_idx on public.leads (is_handled, created_at desc);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_location text,
  transaction_kind text,
  quote text not null check (char_length(trim(quote)) between 1 and 1200),
  rating smallint check (rating between 1 and 5),
  is_published boolean not null default false,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_published_idx
  on public.testimonials (is_published, position);

drop trigger if exists testimonials_touch on public.testimonials;
create trigger testimonials_touch before update on public.testimonials
  for each row execute function public.touch_updated_at();

alter table public.testimonials enable row level security;

drop policy if exists "testimonials public read when published" on public.testimonials;
create policy "testimonials public read when published"
  on public.testimonials for select
  using (is_published or public.is_agent());

drop policy if exists "testimonials written by agent" on public.testimonials;
create policy "testimonials written by agent"
  on public.testimonials for all
  using (public.is_agent())
  with check (public.is_agent());

-- Uploading with upsert issues an update against storage.objects, which had no
-- policy and so failed for the agent.
drop policy if exists "listing photos updated by agent" on storage.objects;
create policy "listing photos updated by agent"
  on storage.objects for update
  using (bucket_id = 'listing-photos' and public.is_agent())
  with check (bucket_id = 'listing-photos' and public.is_agent());
