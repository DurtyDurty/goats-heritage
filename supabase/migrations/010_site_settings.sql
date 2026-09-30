-- Key/value store for runtime settings that must survive deploys
-- (first use: the Instagram long-lived access token, which is refreshed by cron)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

-- Only admins can read or write directly; the server uses the service role.
create policy "Admins can view site settings"
  on public.site_settings for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can upsert site settings"
  on public.site_settings for insert
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update site settings"
  on public.site_settings for update
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');
