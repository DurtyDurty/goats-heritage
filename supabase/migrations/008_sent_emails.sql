create table public.sent_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  message text not null,
  sent_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.sent_emails enable row level security;

create policy "Admins can view sent emails"
  on public.sent_emails for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can insert sent emails"
  on public.sent_emails for insert
  with check (public.get_user_role(auth.uid()) = 'admin');
