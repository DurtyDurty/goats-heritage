-- Customers may edit their own profile row (name, phone, date of birth), but the
-- "Users can update own profile" policy does not limit WHICH columns they change.
-- Without this trigger a signed-in user could set role = 'admin' or
-- age_verified = true on themselves straight from the browser.
--
-- For requests made with a user's own session (authenticated / anon):
--   * role and stripe_customer_id cannot be changed
--   * age_verified is never taken from the client: it is recalculated from the
--     date of birth when that changes, and otherwise left as it was
-- Server code using the service role key, and direct database access, are unaffected.

create or replace function public.protect_profile_fields()
returns trigger as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    new.id := old.id;
    new.role := old.role;
    new.stripe_customer_id := old.stripe_customer_id;

    if new.date_of_birth is distinct from old.date_of_birth then
      new.age_verified := new.date_of_birth is not null
        and new.date_of_birth <= (current_date - interval '21 years')::date;
    else
      new.age_verified := old.age_verified;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_protect_fields on public.profiles;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();
