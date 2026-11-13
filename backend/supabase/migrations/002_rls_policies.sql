-- =========================================================
-- Berwa Collections — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- =========================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Helper: check if caller is admin (using service role or is_admin flag)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── PROFILES ──────────────────────────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT USING (is_admin());

-- ─── CATEGORIES ────────────────────────────────────────────────────────────
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL USING (is_admin());

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────
CREATE POLICY "Public can read active products"
  ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products"
  ON products FOR ALL USING (is_admin());

-- ─── PRODUCT IMAGES ────────────────────────────────────────────────────────
CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL USING (is_admin());

-- ─── ORDERS ────────────────────────────────────────────────────────────────
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read and update all orders"
  ON orders FOR ALL USING (is_admin());

-- ─── ORDER ITEMS ───────────────────────────────────────────────────────────
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can read all order items"
  ON order_items FOR ALL USING (is_admin());

-- ─── PAYMENTS ──────────────────────────────────────────────────────────────
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can submit payment reference"
  ON payments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL USING (is_admin());

-- ─── STORE SETTINGS ────────────────────────────────────────────────────────
CREATE POLICY "Public can read store settings"
  ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage store settings"
  ON store_settings FOR ALL USING (is_admin());
