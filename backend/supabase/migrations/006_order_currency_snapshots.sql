-- Lock the customer's chosen display currency and trusted exchange rate onto
-- each order. Base totals remain RWF so existing reporting stays consistent.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS base_currency TEXT NOT NULL DEFAULT 'RWF' CHECK (base_currency = 'RWF'),
  ADD COLUMN IF NOT EXISTS display_currency TEXT NOT NULL DEFAULT 'RWF' CHECK (display_currency ~ '^[A-Z]{3}$'),
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(20, 8) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  ADD COLUMN IF NOT EXISTS display_subtotal NUMERIC(20, 2) NOT NULL DEFAULT 0 CHECK (display_subtotal >= 0),
  ADD COLUMN IF NOT EXISTS display_delivery_fee NUMERIC(20, 2) NOT NULL DEFAULT 0 CHECK (display_delivery_fee >= 0),
  ADD COLUMN IF NOT EXISTS display_total NUMERIC(20, 2) NOT NULL DEFAULT 0 CHECK (display_total >= 0);

UPDATE orders
SET display_subtotal = subtotal, display_delivery_fee = delivery_fee, display_total = total
WHERE display_currency = 'RWF' AND exchange_rate = 1 AND display_total = 0 AND total > 0;

-- This is intentionally an overload of the prior function. The original is
-- retained for existing integrations; the API now uses this currency-aware
-- signature and is the only caller that can provide the exchange-rate input.
CREATE OR REPLACE FUNCTION create_secure_order(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_district TEXT,
  p_address TEXT,
  p_delivery_instructions TEXT,
  p_payment_method TEXT,
  p_items JSONB,
  p_display_currency TEXT,
  p_exchange_rate NUMERIC
)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  subtotal INTEGER,
  delivery_fee INTEGER,
  total INTEGER,
  display_currency TEXT,
  exchange_rate NUMERIC,
  display_subtotal NUMERIC,
  display_delivery_fee NUMERIC,
  display_total NUMERIC,
  status TEXT,
  payment_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product products%ROWTYPE;
  v_order_id UUID := uuid_generate_v4();
  v_order_number TEXT := 'BC-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 6));
  v_quantity INTEGER;
  v_size TEXT;
  v_color TEXT;
  v_currency TEXT := upper(trim(p_display_currency));
  v_subtotal INTEGER := 0;
  v_delivery_fee INTEGER := 0;
  v_total INTEGER := 0;
  v_display_subtotal NUMERIC(20, 2) := 0;
  v_display_delivery_fee NUMERIC(20, 2) := 0;
  v_display_total NUMERIC(20, 2) := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'An authenticated customer is required' USING ERRCODE = 'P0001';
  END IF;
  IF COALESCE(trim(p_customer_name), '') = '' OR COALESCE(trim(p_customer_phone), '') = ''
     OR COALESCE(trim(p_district), '') = '' OR COALESCE(trim(p_address), '') = '' THEN
    RAISE EXCEPTION 'Missing required delivery details' USING ERRCODE = 'P0001';
  END IF;
  IF p_payment_method NOT IN ('card_payment', 'digital_wallet', 'bank_transfer') THEN
    RAISE EXCEPTION 'Unsupported payment method' USING ERRCODE = 'P0001';
  END IF;
  IF COALESCE(v_currency, '') !~ '^[A-Z]{3}$' OR p_exchange_rate IS NULL OR p_exchange_rate <= 0 OR p_exchange_rate > 1000000 THEN
    RAISE EXCEPTION 'Invalid currency quote' USING ERRCODE = 'P0001';
  END IF;
  IF v_currency = 'RWF' AND p_exchange_rate <> 1 THEN
    RAISE EXCEPTION 'Invalid RWF exchange rate' USING ERRCODE = 'P0001';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO orders (
    id, order_number, user_id, customer_name, customer_phone, district, address,
    delivery_instructions, payment_method, subtotal, delivery_fee, total,
    base_currency, display_currency, exchange_rate, display_subtotal, display_delivery_fee, display_total
  ) VALUES (
    v_order_id, v_order_number, p_user_id, trim(p_customer_name), trim(p_customer_phone), trim(p_district), trim(p_address),
    NULLIF(trim(p_delivery_instructions), ''), p_payment_method, 0, 0, 0,
    'RWF', v_currency, p_exchange_rate, 0, 0, 0
  );

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    BEGIN
      v_quantity := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid cart quantity' USING ERRCODE = 'P0001';
    END;
    v_size := NULLIF(trim(v_item->>'size'), '');
    v_color := NULLIF(trim(v_item->>'color'), '');
    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 50 THEN
      RAISE EXCEPTION 'Invalid cart quantity' USING ERRCODE = 'P0001';
    END IF;

    SELECT * INTO v_product FROM products
    WHERE products.id = (v_item->>'product_id')::UUID AND products.is_active = true
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'A product in your cart is unavailable' USING ERRCODE = 'P0001'; END IF;
    IF v_product.stock_quantity < v_quantity THEN RAISE EXCEPTION '% is no longer available in the requested quantity', v_product.name USING ERRCODE = 'P0001'; END IF;
    IF cardinality(v_product.sizes) > 0 AND (v_size IS NULL OR NOT v_size = ANY(v_product.sizes)) THEN RAISE EXCEPTION 'Select an available size for %', v_product.name USING ERRCODE = 'P0001'; END IF;
    IF cardinality(v_product.colors) > 0 AND (v_color IS NULL OR NOT v_color = ANY(v_product.colors)) THEN RAISE EXCEPTION 'Select an available colour for %', v_product.name USING ERRCODE = 'P0001'; END IF;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity, size, color)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.sku, v_product.price, v_quantity, v_size, v_color);
    UPDATE products SET stock_quantity = stock_quantity - v_quantity, updated_at = NOW() WHERE id = v_product.id;
  END LOOP;

  SELECT COALESCE(NULLIF(value, ''), '0')::INTEGER INTO v_delivery_fee FROM store_settings WHERE key = 'delivery_fee_international';
  v_delivery_fee := COALESCE(v_delivery_fee, 0);
  v_total := v_subtotal + v_delivery_fee;
  v_display_subtotal := ROUND(v_subtotal * p_exchange_rate, 2);
  v_display_delivery_fee := ROUND(v_delivery_fee * p_exchange_rate, 2);
  v_display_total := ROUND(v_total * p_exchange_rate, 2);

  UPDATE orders SET
    subtotal = v_subtotal, delivery_fee = v_delivery_fee, total = v_total,
    display_subtotal = v_display_subtotal, display_delivery_fee = v_display_delivery_fee, display_total = v_display_total,
    updated_at = NOW()
  WHERE orders.id = v_order_id;
  INSERT INTO payments (order_id, method) VALUES (v_order_id, p_payment_method);

  RETURN QUERY SELECT v_order_id, v_order_number, v_subtotal, v_delivery_fee, v_total, v_currency, p_exchange_rate,
    v_display_subtotal, v_display_delivery_fee, v_display_total, 'pending_payment'::TEXT, 'awaiting_payment'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION create_secure_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_secure_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, NUMERIC) TO service_role;
