CREATE OR REPLACE FUNCTION get_orders_with_details()
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric,
  delivery_estimate text,
  created_at timestamptz,
  shops json,
  order_items json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.status,
    o.total_amount,
    o.delivery_estimate,
    o.created_at,
    json_build_object(
      'name', s.name,
      'location', s.location,
      'profiles', json_build_object(
        'full_name', p.full_name,
        'phone', p.phone
      )
    ) as shops,
    (
      SELECT json_agg(
        json_build_object(
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'products', json_build_object(
            'code', pr.code,
            'name', pr.name
          )
        )
      )
      FROM order_items oi
      JOIN products pr ON oi.product_id = pr.id
      WHERE oi.order_id = o.id
    ) as order_items
  FROM
    orders o
    JOIN shops s ON o.shop_id = s.id
    JOIN profiles p ON s.owner_id = p.user_id
  ORDER BY
    o.created_at DESC;
END;
$$ LANGUAGE plpgsql;
