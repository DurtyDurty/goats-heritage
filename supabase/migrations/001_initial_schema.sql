-- ============================================================
-- Goats Heritage: Initial Schema
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Helper function: auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  phone text,
  date_of_birth date,
  age_verified boolean default false,
  role text default 'customer' check (role in ('customer', 'member', 'admin')),
  stripe_customer_id text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- Helper function: get user role from profiles
-- ============================================================
create or replace function public.get_user_role(uid uuid)
returns text as $$
  select role from public.profiles where id = uid;
$$ language sql security definer stable;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. products
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text not null check (category in ('cigar', 'apparel', 'accessory', 'lifestyle')),
  price_cents integer not null,
  compare_at_price_cents integer,
  images text[] default '{}',
  inventory_count integer default 0,
  is_active boolean default true,
  is_member_exclusive boolean default false,
  metadata jsonb default '{}',
  stripe_price_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Products policies
create policy "Anyone can view active non-exclusive products"
  on public.products for select
  using (
    is_active = true
    and (
      is_member_exclusive = false
      or public.get_user_role(auth.uid()) in ('member', 'admin')
    )
  );

create policy "Admins can view all products"
  on public.products for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can insert products"
  on public.products for insert
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update products"
  on public.products for update
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can delete products"
  on public.products for delete
  using (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- 3. orders
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_cents integer not null,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  shipping_address jsonb,
  tracking_number text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Orders policies
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Authenticated users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 4. order_items
-- ============================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null,
  unit_price_cents integer not null
);

alter table public.order_items enable row level security;

-- Order items policies
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Authenticated users can create order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. subscriptions
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  tier text not null default 'monthly_box',
  status text default 'active' check (status in ('active', 'paused', 'cancelled', 'past_due')),
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Subscriptions policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can insert subscriptions"
  on public.subscriptions for insert
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update subscriptions"
  on public.subscriptions for update
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can delete subscriptions"
  on public.subscriptions for delete
  using (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- 6. events
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  capacity integer,
  is_members_only boolean default false,
  image_url text,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

-- Events policies
create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Admins can insert events"
  on public.events for insert
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update events"
  on public.events for update
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can delete events"
  on public.events for delete
  using (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- 7. event_rsvps
-- ============================================================
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text default 'confirmed' check (status in ('confirmed', 'waitlisted', 'cancelled')),
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

-- Event RSVPs policies
create policy "Users can view own RSVPs"
  on public.event_rsvps for select
  using (auth.uid() = user_id);

create policy "Admins can view all RSVPs"
  on public.event_rsvps for select
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "Users can create own RSVPs"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own RSVPs"
  on public.event_rsvps for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can insert RSVPs"
  on public.event_rsvps for insert
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update RSVPs"
  on public.event_rsvps for update
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can delete RSVPs"
  on public.event_rsvps for delete
  using (public.get_user_role(auth.uid()) = 'admin');
