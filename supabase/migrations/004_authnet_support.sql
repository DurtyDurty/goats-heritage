-- Add Authorize.Net columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS authnet_transaction_id text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS authnet_subscription_id text;

-- Make Stripe columns nullable (keep for historical reference)
ALTER TABLE orders ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN stripe_checkout_session_id DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN stripe_subscription_id DROP NOT NULL;
