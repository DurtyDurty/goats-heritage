-- Which gateway took the payment and its transaction reference (needed for refunds).
-- Bankful hosted-page orders set payment_provider = 'bankful' and
-- payment_reference = Bankful's TRANS_ORDER_ID.
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_reference text;
