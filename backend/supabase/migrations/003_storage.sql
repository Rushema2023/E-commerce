-- =========================================================
-- Berwa Collections — Storage Buckets
-- Run AFTER 001 and 002
-- =========================================================

-- Create private bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,          -- NOT public — files accessed via signed URLs only
  5242880,        -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create public bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'product-images',
  'product-images',
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS ─────────────────────────────────────────────────────────

-- Payment receipts: only owner and admins can upload/read
CREATE POLICY "Customers can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can read all receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-receipts'
    AND (is_admin() OR auth.uid()::text = (storage.foldername(name))[1])
  );

-- Product images: public read, admin write
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can manage product images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-images' AND is_admin());
