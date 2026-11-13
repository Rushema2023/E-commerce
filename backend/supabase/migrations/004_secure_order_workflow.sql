-- Secure order creation and privilege hardening.
-- Run after 001_initial_schema.sql through 003_storage.sql.

-- A customer must never be able to promote their own profile by updating
-- is_admin. Keep profile updates limited to the customer-facing fields.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile fields"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = public.is_admin()
  );

-- Payment records are created with an order. References are attached by the
-- server endpoint, after it has checked order ownership; clients cannot update
-- payment rows directly or approve one.
DROP POLICY IF EXISTS "Users can submit payment reference" ON payments;

-- Replace the broad upload policy from 003. Receipt object keys must begin
-- with the authenticated user's UUID, e.g. <user-id>/<order-id>/receipt.png.
DROP POLICY IF EXISTS "Customers can upload their own receipts" ON storage.objects;
CREATE POLICY "Customers can upload receipts in their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Orders are created only by the trusted server-side RPC below. This prevents
-- browsers from choosing totals or changing stock quantities.
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

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
  v_fee_key TEXT;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'An authenticated customer is required' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(trim(p_customer_name), '') = '' OR COALESCE(trim(p_customer_phone), '') = ''
     OR COALESCE(trim(p_district), '') = '' OR COALESCE(trim(p_address), '') = '' THEN
    RAISE EXCEPTION 'Missing required delivery details' USING ERRCODE = 'P0001';
  END IF;

  IF p_payment_method NOT IN ('mtn_momo', 'airtel_money', 'bank_transfer') THEN
    RAISE EXCEPTION 'Unsupported payment method' USING ERRCODE = 'P0001';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty' USING ERRCODE = 'P0001';
  END IF;

  -- Create the parent row before its line items. The temporary zero totals are
  -- replaced below in the same transaction after trusted prices are calculated.
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

  v_fee_key := CASE WHEN lower(trim(p_district)) = 'kigali' THEN 'delivery_fee_kigali' ELSE 'delivery_fee_other' END;
  SELECT COALESCE(NULLIF(value, ''), '0')::INTEGER INTO v_delivery_fee
  FROM store_settings WHERE key = v_fee_key;
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
