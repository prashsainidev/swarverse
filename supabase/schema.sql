create table if not exists public.songs (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  title text not null,
  artist text not null default '',
  link text not null,
  type text not null default 'chords',
  difficulty text not null default 'beginner',
  tags text[] not null default '{}',
  favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

alter table public.songs add column if not exists deleted_at timestamptz;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

revoke all on public.admin_users from anon, authenticated;

grant select on public.songs to anon, authenticated;
grant insert, update, delete on public.songs to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop trigger if exists songs_set_updated_at on public.songs;
create trigger songs_set_updated_at
before update on public.songs
for each row
execute function public.set_updated_at();

alter table public.songs enable row level security;
alter table public.songs force row level security;

drop policy if exists "Users can read their own songs" on public.songs;
drop policy if exists "Users can insert their own songs" on public.songs;
drop policy if exists "Users can update their own songs" on public.songs;
drop policy if exists "Users can delete their own songs" on public.songs;
drop policy if exists "Public can read songs" on public.songs;
drop policy if exists "Admins can insert songs" on public.songs;
drop policy if exists "Admins can update songs" on public.songs;
drop policy if exists "Admins can delete songs" on public.songs;

create policy "Public can read songs"
on public.songs
for select
using (deleted_at is null or public.is_admin());

create policy "Admins can insert songs"
on public.songs
for insert
with check (public.is_admin() and auth.uid() = user_id);

create policy "Admins can update songs"
on public.songs
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete songs"
on public.songs
for delete
using (public.is_admin());

-- After running this file, add your admin email once:
-- insert into public.admin_users (email)
-- values ('your-admin-email@example.com')
-- on conflict (email) do nothing;
