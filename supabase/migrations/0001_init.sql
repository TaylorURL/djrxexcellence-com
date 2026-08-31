create extension if not exists "pgcrypto";

create type public.user_role as enum ('member', 'agent');

create type public.listing_status as enum (
  'coming_soon',
  'active',
  'pending',
  'sold',
  'off_market'
);

create type public.property_type as enum (
  'single_family',
  'townhouse',
  'condo',
  'multi_family',
  'land',
  'farm_ranch',
  'commercial'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status public.listing_status not null default 'active',
  property_type public.property_type not null default 'single_family',
  price numeric(12, 2),
  street_address text not null,
  city text not null,
  state text not null default 'TX',
  zip text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  beds smallint,
  baths numeric(3, 1),
  half_baths smallint,
  square_feet integer,
  lot_size_acres numeric(10, 3),
  year_built smallint,
  garage_spaces smallint,
  hoa_fee numeric(10, 2),
  taxes_annual numeric(10, 2),
  school_district text,
  mls_number text,
  description text,
  features text[] not null default '{}',
  virtual_tour_url text,
  video_url text,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_idx on public.listings (status);
create index listings_city_idx on public.listings (city);
create index listings_price_idx on public.listings (price);
create index listings_featured_idx on public.listings (is_featured) where is_featured;

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_idx on public.listing_images (listing_id, position);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_listing_idx on public.comments (listing_id, created_at desc);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  kind text not null default 'contact',
  full_name text not null,
  email text not null,
  phone text,
  message text,
  source_path text,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index leads_created_idx on public.leads (created_at desc);

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
