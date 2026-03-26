create or replace function public.decrement_inventory(
  p_product_id uuid,
  p_quantity integer
)
returns void as $$
begin
  update public.products
  set inventory_count = greatest(inventory_count - p_quantity, 0)
  where id = p_product_id;
end;
$$ language plpgsql security definer;
