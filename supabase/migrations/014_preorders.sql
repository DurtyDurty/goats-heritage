-- Pre-orders: a product switched to pre-order can be bought even with no stock.
-- preorder_note is the optional "ships by" text shown to customers.
alter table public.products add column if not exists is_preorder boolean not null default false;
alter table public.products add column if not exists preorder_note text;

-- Remembers which order lines were bought as pre-orders, even after the product
-- is switched back to normal sale.
alter table public.order_items add column if not exists is_preorder boolean not null default false;
