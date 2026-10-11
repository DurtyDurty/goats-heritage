-- Upcoming products: planned additions to the product line that are kept in the
-- admin only. An upcoming product is always inactive (is_active = false), so the
-- storefront never shows it; is_upcoming just tells it apart from a product that
-- was deactivated. upcoming_note is a private planning note for admins.
alter table public.products add column if not exists is_upcoming boolean not null default false;
alter table public.products add column if not exists upcoming_note text;
