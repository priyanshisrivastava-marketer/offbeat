-- Run this once in Supabase's SQL Editor (Dashboard → SQL Editor → New Query → paste → Run)

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  default_city text,
  favorite_vibe text,
  favorite_companion text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create table completed_adventures (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text,
  city text,
  vibe text,
  companion text,
  completed_at timestamp with time zone default now()
);

alter table completed_adventures enable row level security;

create policy "Users can view own completed adventures"
  on completed_adventures for select
  using (auth.uid() = user_id);

create policy "Users can insert own completed adventures"
  on completed_adventures for insert
  with check (auth.uid() = user_id);
