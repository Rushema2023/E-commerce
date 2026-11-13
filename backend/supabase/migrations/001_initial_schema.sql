-- =========================================================
-- Berwa Collections — Initial Schema
-- Run this in Supabase SQL Editor (Database → SQL Editor)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  phone         TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── CATEGORIES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  price            INTEGER NOT NULL CHECK (price >= 0), -- RWF, no decimals
  slug             TEXT NOT NULL UNIQUE,
  sku              TEXT NOT NULL UNIQUE,
  stock_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival   BOOLEAN NOT NULL DEFAULT false,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sizes            TEXT[] NOT NULL DEFAULT '{}',
  colors           TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ─── PRODUCT IMAGES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ─── ORDERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          TEXT NOT NULL UNIQUE,
  user_id               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name         TEXT NOT NULL,
  customer_phone        TEXT NOT NULL,
  district              TEXT NOT NULL,
  address               TEXT NOT NULL,
  delivery_instructions TEXT,
  payment_method        TEXT NOT NULL,
  subtotal              INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee          INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total                 INTEGER NOT NULL CHECK (total >= 0),
  status                TEXT NOT NULL DEFAULT 'pending_payment'
                          CHECK (status IN ('pending_payment','confirmed','processing','shipped','delivered','cancelled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ─── ORDER ITEMS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,  -- snapshot at order time
  product_sku   TEXT NOT NULL,  -- snapshot at order time
  price         INTEGER NOT NULL CHECK (price >= 0), -- snapshot at order time
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  size          TEXT,
  color         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── PAYMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  method                TEXT NOT NULL,
  transaction_reference TEXT,
  receipt_storage_path  TEXT, -- private Supabase Storage path
  status                TEXT NOT NULL DEFAULT 'awaiting_payment'
                          CHECK (status IN ('awaiting_payment','submitted','approved','rejected','refunded')),
  admin_notes           TEXT,
  reviewed_by           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ─── STORE SETTINGS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL DEFAULT '',
  label       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default store settings
INSERT INTO store_settings (key, value, label) VALUES
  ('mtn_momo_number',     '',  'MTN Mobile Money Number'),
  ('airtel_money_number', '',  'Airtel Money Number'),
  ('bank_name',           '',  'Bank Name'),
  ('bank_account_name',   '',  'Bank Account Name'),
  ('bank_account_number', '',  'Bank Account Number'),
  ('delivery_fee_kigali', '0', 'Delivery Fee — Kigali (RWF)'),
  ('delivery_fee_other',  '0', 'Delivery Fee — Other Districts (RWF)'),
  ('whatsapp_number',     '',  'WhatsApp Contact Number')
ON CONFLICT (key) DO NOTHING;
