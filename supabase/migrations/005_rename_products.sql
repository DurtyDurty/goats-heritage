-- Rename Heritage Robusto to Baby Goats
UPDATE products SET
  name = 'Baby Goats',
  slug = 'baby-goats',
  description = 'A unique flavored cigar with sweet berry and honey vanilla notes. Perfect mild blend with the perfect draw and fusion between flavor and aromatics.',
  images = ARRAY['/images/products/baby-goats.webp'],
  metadata = '{"origin": "Nicaragua", "strength": "Mild", "ring_gauge": 50, "wrapper": "Connecticut", "flavor": "Sweet Berry & Honey Vanilla"}'
WHERE slug = 'heritage-robusto';

-- Rename Legacy Toro to Florentino
UPDATE products SET
  name = 'Florentino',
  slug = 'florentino',
  description = 'A premium cigar with peppery notes in honor of devotion and history. For the guardians of heritage who inspired GOATS.',
  images = ARRAY['/images/products/florentino.webp'],
  metadata = '{"origin": "Nicaragua", "strength": "Medium-Full", "ring_gauge": 52, "wrapper": "Habano", "flavor": "Peppery"}'
WHERE slug = 'legacy-toro';
