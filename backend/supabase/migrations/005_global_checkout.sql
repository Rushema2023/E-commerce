-- Global checkout support. The existing `district` column remains in place for
-- backward compatibility and now stores the customer's country or region.

INSERT INTO store_settings (key, value, label) VALUES
  ('delivery_fee_international', '0', 'International Delivery Fee (base currency)')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION create_secure_order(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_district TEXT,
  p_address TEXT,
  p_delivery_instructions TEXT,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  subtotal INTEGER,
  delivery_fee INTEGER,
  total INTEGER,
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
  v_subtotal INTEGER := 0;
  v_delivery_fee INTEGER := 0;
  v_total INTEGER := 0;
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

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO orders (
    id, order_number, user_id, customer_name, customer_phone, district, address,
    delivery_instructions, payment_method, subtotal, delivery_fee, total
  ) VALUES (
    v_order_id, v_order_number, p_user_id, trim(p_customer_name), trim(p_customer_phone), trim(p_district), trim(p_address),
    NULLIF(trim(p_delivery_instructions), ''), p_payment_method, 0, 0, 0
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

    SELECT * INTO v_product
    FROM products
    WHERE products.id = (v_item->>'product_id')::UUID
      AND products.is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is unavailable' USING ERRCODE = 'P0001';
    END IF;
    IF v_product.stock_quantity < v_quantity THEN
      RAISE EXCEPTION '% is no longer available in the requested quantity', v_product.name USING ERRCODE = 'P0001';
    END IF;
    IF cardinality(v_product.sizes) > 0 AND (v_size IS NULL OR NOT v_size = ANY(v_product.sizes)) THEN
      RAISE EXCEPTION 'Select an available size for %', v_product.name USING ERRCODE = 'P0001';
    END IF;
    IF cardinality(v_product.colors) > 0 AND (v_color IS NULL OR NOT v_color = ANY(v_product.colors)) THEN
      RAISE EXCEPTION 'Select an available colour for %', v_product.name USING ERRCODE = 'P0001';
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);

    INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity, size, color)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.sku, v_product.price, v_quantity, v_size, v_color);

    UPDATE products
    SET stock_quantity = stock_quantity - v_quantity, updated_at = NOW()
    WHERE id = v_product.id;
  END LOOP;

  SELECT COALESCE(NULLIF(value, ''), '0')::INTEGER INTO v_delivery_fee
  FROM store_settings
  WHERE key = 'delivery_fee_international';
  v_delivery_fee := COALESCE(v_delivery_fee, 0);
  v_total := v_subtotal + v_delivery_fee;

  UPDATE orders
  SET subtotal = v_subtotal, delivery_fee = v_delivery_fee, total = v_total, updated_at = NOW()
  WHERE orders.id = v_order_id;

  INSERT INTO payments (order_id, method) VALUES (v_order_id, p_payment_method);

  RETURN QUERY SELECT v_order_id, v_order_number, v_subtotal, v_delivery_fee, v_total, 'pending_payment'::TEXT, 'awaiting_payment'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION create_secure_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_secure_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
