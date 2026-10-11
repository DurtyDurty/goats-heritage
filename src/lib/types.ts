export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: "cigar" | "apparel" | "accessory" | "coffee";
  price_cents: number;
  compare_at_price_cents: number | null;
  images: string[];
  inventory_count: number;
  is_active: boolean;
  is_member_exclusive: boolean;
  /** Pre-order: can be bought with no stock. Set in Admin > Products. */
  is_preorder: boolean;
  /** Optional "ships by" text shown to customers on a pre-order product. */
  preorder_note: string | null;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  cigar: "Cigars",
  apparel: "Apparel",
  accessory: "Accessories",
  coffee: "Coffee",
};
