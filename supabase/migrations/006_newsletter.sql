-- Newsletter subscribers table
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  source text default 'website',
  subscribed boolean default true,
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Only admins can view subscribers
create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  using (public.get_user_role(auth.uid()) = 'admin');

-- Anyone can insert (public signup)
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);
