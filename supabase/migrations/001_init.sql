-- Giveaway Tracker: initial schema
-- รันใน Supabase Dashboard > SQL Editor ครั้งเดียว

create extension if not exists pgcrypto;

create table if not exists public.lists (
  code       text primary key
             check (code ~ '^[a-z0-9-]{8,40}$'),
  accent     text not null default 'pink'
             check (accent in ('pink', 'lavender', 'mint', 'peach')),
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  list_code  text not null references public.lists(code) on delete cascade,
  url        text not null
             check (char_length(url) <= 2000 and url ~* '^https?://'),
  title      text check (char_length(title) <= 120),
  pickup     text check (char_length(pickup) <= 80),
  note       text check (char_length(note) <= 500),
  image      text check (char_length(image) <= 2000),
  author     text check (char_length(author) <= 100),
  collected  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_list_code_idx on public.items (list_code);

-- keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- RLS on, no policies: anon/authenticated keys can't read or write.
-- Only the server (service_role key) can access these tables.
alter table public.lists enable row level security;
alter table public.items enable row level security;
