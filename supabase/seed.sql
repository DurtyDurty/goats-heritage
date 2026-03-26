-- ============================================
-- Goats Heritage - Seed Data
-- ============================================

-- -----------------------------------------------
-- Products: Cigars
-- -----------------------------------------------
INSERT INTO products (id, name, slug, category, description, price_cents, compare_at_price_cents, images, metadata, inventory_count, is_active, is_member_exclusive)
VALUES
  (
    gen_random_uuid(),
    'Heritage Robusto',
    'heritage-robusto',
    'cigar',
    'A masterfully blended robusto with rich notes of cedar, leather, and a subtle sweetness on the finish. Handcrafted in Nicaragua with a silky Habano wrapper for an unforgettable medium-bodied smoke.',
    1800,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/cigars/heritage-robusto.jpg'],
    '{"origin": "Nicaragua", "strength": "Medium", "ring_gauge": 50, "wrapper": "Habano"}',
    35,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Legacy Toro',
    'legacy-toro',
    'cigar',
    'Bold and complex, the Legacy Toro delivers a full-bodied experience with deep espresso and dark chocolate undertones. Wrapped in a lush Dominican Maduro leaf that burns evenly from start to finish.',
    2200,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/cigars/legacy-toro.jpg'],
    '{"origin": "Dominican Republic", "strength": "Full", "ring_gauge": 52, "wrapper": "Maduro"}',
    28,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Crown Churchill',
    'crown-churchill',
    'cigar',
    'An elegant mild smoke perfect for leisurely afternoons. The Crown Churchill features a creamy Connecticut wrapper with delicate notes of cream, almonds, and white pepper. A refined choice for any occasion.',
    2800,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/cigars/crown-churchill.jpg'],
    '{"origin": "Honduras", "strength": "Mild", "ring_gauge": 48, "wrapper": "Connecticut"}',
    20,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Gold Reserve Lancero',
    'gold-reserve-lancero',
    'cigar',
    'Reserved exclusively for Goats Heritage members, this limited-edition Lancero features a rare Oscuro wrapper aged for 18 months. Expect bold flavors of dark roast coffee, black pepper, and a lingering smoky sweetness.',
    3500,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/cigars/gold-reserve-lancero.jpg'],
    '{"origin": "Nicaragua", "strength": "Full", "ring_gauge": 38, "wrapper": "Oscuro"}',
    12,
    true,
    true
  );

-- -----------------------------------------------
-- Products: Apparel
-- -----------------------------------------------
INSERT INTO products (id, name, slug, category, description, price_cents, compare_at_price_cents, images, metadata, inventory_count, is_active, is_member_exclusive)
VALUES
  (
    gen_random_uuid(),
    'Heritage Snapback',
    'heritage-snapback',
    'apparel',
    'Premium structured snapback cap featuring the iconic Goats Heritage embroidered logo in gold thread. Adjustable snap closure fits all sizes comfortably.',
    3200,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/apparel/heritage-snapback.jpg'],
    '{}',
    45,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Classic Logo Tee',
    'classic-logo-tee',
    'apparel',
    'Heavyweight 100% cotton tee with a relaxed fit and the Goats Heritage crest screen-printed on the chest. Pre-shrunk for a consistent fit wash after wash.',
    2800,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/apparel/classic-logo-tee.jpg'],
    '{}',
    50,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Gold Standard Hoodie',
    'gold-standard-hoodie',
    'apparel',
    'Luxury fleece-lined hoodie with gold-embroidered Goats Heritage branding. Features a kangaroo pocket, ribbed cuffs, and a double-layered hood for extra warmth.',
    6500,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/apparel/gold-standard-hoodie.jpg'],
    '{}',
    30,
    true,
    false
  );

-- -----------------------------------------------
-- Products: Accessories
-- -----------------------------------------------
INSERT INTO products (id, name, slug, category, description, price_cents, compare_at_price_cents, images, metadata, inventory_count, is_active, is_member_exclusive)
VALUES
  (
    gen_random_uuid(),
    'Heritage Torch Lighter',
    'heritage-torch-lighter',
    'accessory',
    'Triple-jet torch lighter with a built-in cigar punch and adjustable flame. Finished in matte black with the Goats Heritage crest laser-engraved on the body.',
    4500,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/accessories/heritage-torch-lighter.jpg'],
    '{}',
    25,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Gold Cutter V-Cut',
    'gold-cutter-v-cut',
    'accessory',
    'Precision V-cut cigar cutter crafted from stainless steel with gold-plated accents. Spring-loaded action ensures a clean, deep cut every time.',
    3800,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/accessories/gold-cutter-v-cut.jpg'],
    '{}',
    40,
    true,
    false
  );

-- -----------------------------------------------
-- Products: Lifestyle
-- -----------------------------------------------
INSERT INTO products (id, name, slug, category, description, price_cents, compare_at_price_cents, images, metadata, inventory_count, is_active, is_member_exclusive)
VALUES
  (
    gen_random_uuid(),
    'Crystal Ashtray',
    'crystal-ashtray',
    'lifestyle',
    'Hand-cut crystal ashtray with four cigar rests and a weighted base. The timeless design adds sophistication to any lounge or home office.',
    5500,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/lifestyle/crystal-ashtray.jpg'],
    '{}',
    15,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'Whiskey Glass Set',
    'whiskey-glass-set',
    'lifestyle',
    'Set of two hand-blown rocks glasses with a thick weighted base. Perfect for sipping your favorite spirit alongside a fine cigar.',
    4800,
    NULL,
    ARRAY['https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/products/lifestyle/whiskey-glass-set.jpg'],
    '{}',
    22,
    true,
    false
  );

-- -----------------------------------------------
-- Events
-- -----------------------------------------------
INSERT INTO events (id, title, description, event_date, location, capacity, is_members_only, image_url)
VALUES
  (
    gen_random_uuid(),
    'Spring Smoke & Social',
    'Kick off the season with an evening of premium cigars, craft cocktails, and great conversation. Open to all cigar enthusiasts — whether you are a seasoned aficionado or just getting started. Live music, a curated cigar bar, and complimentary appetizers included.',
    '2026-04-16 19:00:00+00',
    'Houston, TX',
    50,
    false,
    'https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/events/spring-smoke-social.jpg'
  ),
  (
    gen_random_uuid(),
    'Members Lounge Night',
    'An exclusive evening reserved for Goats Heritage members. Enjoy a private lounge setting with rare cigar selections, top-shelf whiskey pairings, and networking with fellow members. Limited to 25 guests for an intimate experience.',
    '2026-04-23 20:00:00+00',
    'Dallas, TX',
    25,
    true,
    'https://lixyenbgoxgggbuvudkg.supabase.co/storage/v1/object/public/events/members-lounge-night.jpg'
  );
