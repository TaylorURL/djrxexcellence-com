create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'agent'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();
create trigger comments_touch before update on public.comments
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.comments enable row level security;
alter table public.leads enable row level security;
alter table public.saved_searches enable row level security;

create policy "profiles readable by owner and agent"
  on public.profiles for select
  using (id = auth.uid() or public.is_agent());

create policy "profiles updatable by owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "listings public read when published"
  on public.listings for select
  using (published_at is not null or public.is_agent());

create policy "listings written by agent"
  on public.listings for all
  using (public.is_agent())
  with check (public.is_agent());

create policy "listing images follow listing visibility"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.published_at is not null or public.is_agent())
    )
  );

create policy "listing images written by agent"
  on public.listing_images for all
  using (public.is_agent())
  with check (public.is_agent());

create policy "favorites owned by user"
  on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "comments public read when visible"
  on public.comments for select
  using (
    (not is_hidden or author_id = auth.uid() or public.is_agent())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.published_at is not null
    )
  );

create policy "comments created by signed in user"
  on public.comments for insert
  with check (author_id = auth.uid());

create policy "comments updated by author"
  on public.comments for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments deleted by author or agent"
  on public.comments for delete
  using (author_id = auth.uid() or public.is_agent());

create policy "comments moderated by agent"
  on public.comments for update
  using (public.is_agent())
  with check (public.is_agent());

create policy "leads created by anyone"
  on public.leads for insert
  with check (true);

create policy "leads read by agent"
  on public.leads for select
  using (public.is_agent());

create policy "leads updated by agent"
  on public.leads for update
  using (public.is_agent())
  with check (public.is_agent());

create policy "saved searches owned by user"
  on public.saved_searches for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "listing photos public read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "listing photos written by agent"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and public.is_agent());

create policy "listing photos removed by agent"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and public.is_agent());
