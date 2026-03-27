create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

create policy "Admins can view messages"
  on public.contact_messages for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update messages"
  on public.contact_messages for update
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Anyone can insert messages"
  on public.contact_messages for insert
  with check (true);
