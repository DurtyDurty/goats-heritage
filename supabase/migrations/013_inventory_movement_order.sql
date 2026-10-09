-- Links a sale movement to the website order that caused it, so the inventory
-- movement history can show whether that order has shipped yet.
alter table public.inventory_movements
  add column if not exists order_id uuid references public.orders(id) on delete set null;

-- Sales logged before this column existed carry the order in their note ("Order 1a2b3c4d")
update public.inventory_movements m
set order_id = o.id
from public.orders o
where m.order_id is null
  and m.type = 'sale'
  and m.notes = 'Order ' || left(o.id::text, 8);
