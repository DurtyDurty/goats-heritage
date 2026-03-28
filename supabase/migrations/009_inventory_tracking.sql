-- Add SKU and MCU columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mcu text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_cents integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_oz numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_point integer DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS location text;

-- Inventory movement log
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id),
  type text NOT NULL CHECK (type IN ('restock', 'sale', 'adjustment', 'return', 'damaged')),
  quantity integer NOT NULL,
  previous_count integer NOT NULL,
  new_count integer NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inventory movements"
  ON public.inventory_movements FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert inventory movements"
  ON public.inventory_movements FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
