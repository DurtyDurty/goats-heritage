-- Update product images with Unsplash stock photos
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1547424450-a69b33b2cdc2?w=800&q=80'] WHERE slug = 'heritage-robusto';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1653417391820-a6f9a11a409e?w=800&q=80'] WHERE slug = 'legacy-toro';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1717932936440-c10ccdc4a8e4?w=800&q=80'] WHERE slug = 'crown-churchill';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1653417391820-a6f9a11a409e?w=800&q=80'] WHERE slug = 'gold-reserve-lancero';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1519079754742-f83afaef6d35?w=800&q=80'] WHERE slug = 'heritage-snapback';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=800&q=80'] WHERE slug = 'classic-logo-tee';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1647797819874-f51a8a8fc5c0?w=800&q=80'] WHERE slug = 'gold-standard-hoodie';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1650756101239-6f235c0f6c45?w=800&q=80'] WHERE slug = 'heritage-torch-lighter';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1547652577-b4fe2f34d7ee?w=800&q=80'] WHERE slug = 'gold-cutter-v-cut';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1676270363438-b3ddec3a7290?w=800&q=80'] WHERE slug = 'crystal-ashtray';
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1737478580339-b6def2f84087?w=800&q=80'] WHERE slug = 'whiskey-glass-set';

-- Update event images
UPDATE events SET image_url = 'https://images.unsplash.com/photo-1593896385987-16bcbf9451e5?w=1200&q=80' WHERE title = 'Spring Smoke & Social';
UPDATE events SET image_url = 'https://images.unsplash.com/photo-1493328628492-54491d37daba?w=1200&q=80' WHERE title = 'Members Lounge Night';
