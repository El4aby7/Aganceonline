-- 1. Create the App Settings Table
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

-- 2. Insert the initial USD to EGP Exchange Rate
insert into public.app_settings (key, value)
values ('USD_TO_EGP', '50')
on conflict (key) do nothing;

-- 3. Enable Row Level Security (RLS)
alter table public.app_settings enable row level security;

-- 4. Create Security Policies

-- Policy: Everyone can READ settings (needed for public site price calculation)
create policy "Public Read Settings"
on public.app_settings for select
to anon
using (true);

-- Policy: Authenticated users (Admins) can READ settings
create policy "Authenticated Read Settings"
on public.app_settings for select
to authenticated
using (true);

-- Policy: Only Admins (Authenticated Users) can MODIFY settings
create policy "Admin Modify Settings"
on public.app_settings for all
to authenticated
using (true)
with check (true);
