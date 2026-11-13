-- Development catalogue only. Run after migrations 001 through 004.
-- Replace the external example image URLs with owned product photos before launch.

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Men', 'men', 'Classic and modern menswear.', 1),
  ('Women', 'women', 'Elegant clothing for women.', 2),
  ('Accessories', 'accessories', 'Finishing touches for every outfit.', 3)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

WITH seed_products (name, description, category_slug, price, slug, sku, stock_quantity, is_featured, is_new_arrival, sizes, colors) AS (
  VALUES
    ('Classic Blazer', 'A timeless blazer for formal and smart-casual occasions.', 'men', 85000, 'classic-blazer', 'MN-BLZ-001', 15, true, false, ARRAY['S','M','L','XL','XXL'], ARRAY['Navy','Charcoal','Black']),
    ('Elegant Midi Dress', 'A flowing midi dress for daytime and evening occasions.', 'women', 72000, 'elegant-midi-dress', 'WN-DRS-001', 20, true, false, ARRAY['XS','S','M','L','XL'], ARRAY['Forest Green','Burgundy','Navy']),
    ('Oxford Shirt', 'A crisp tailored Oxford shirt in premium cotton.', 'men', 45000, 'oxford-shirt', 'MN-SHT-001', 30, false, true, ARRAY['S','M','L','XL','XXL'], ARRAY['Sky Blue','White','Light Gray']),
    ('Leather Handbag', 'A spacious leather handbag with an adjustable strap.', 'accessories', 68000, 'leather-handbag', 'AC-BAG-001', 10, true, true, ARRAY[]::TEXT[], ARRAY['Tan','Black','Dark Brown']),
    ('Classic Sneakers', 'Clean minimalist leather sneakers with a cushioned sole.', 'men', 62000, 'classic-sneakers', 'MN-SNK-001', 25, true, false, ARRAY['39','40','41','42','43','44','45'], ARRAY['White','Off-White','Light Gray']),
    ('Designer Sunglasses', 'UV-protection sunglasses with a timeless acetate frame.', 'accessories', 38000, 'designer-sunglasses', 'AC-SNG-001', 40, false, false, ARRAY[]::TEXT[], ARRAY['Tortoise','Black','Brown'])
)
INSERT INTO products (name, description, category_id, price, slug, sku, stock_quantity, is_featured, is_new_arrival, sizes, colors)
SELECT seed.name, seed.description, categories.id, seed.price, seed.slug, seed.sku, seed.stock_quantity, seed.is_featured, seed.is_new_arrival, seed.sizes, seed.colors
FROM seed_products seed JOIN categories ON categories.slug = seed.category_slug
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, category_id = EXCLUDED.category_id, price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity, is_featured = EXCLUDED.is_featured, is_new_arrival = EXCLUDED.is_new_arrival,
  sizes = EXCLUDED.sizes, colors = EXCLUDED.colors, updated_at = NOW();

WITH seed_images (sku, url, alt) AS (
  VALUES
    ('MN-BLZ-001', 'https://images.unsplash.com/photo-1594938298603-c8148c4b2dda?w=600&q=80', 'Classic blazer'),
    ('WN-DRS-001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', 'Elegant midi dress'),
    ('MN-SHT-001', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', 'Oxford shirt'),
    ('AC-BAG-001', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', 'Leather handbag'),
    ('MN-SNK-001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 'Classic sneakers'),
    ('AC-SNG-001', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', 'Designer sunglasses')
)
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order)
SELECT products.id, seed_images.url, seed_images.alt, true, 0
FROM seed_images JOIN products ON products.sku = seed_images.sku
WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_images.product_id = products.id AND product_images.is_primary = true);
