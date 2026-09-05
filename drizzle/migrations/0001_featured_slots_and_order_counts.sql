ALTER TABLE public.theme_settings
  ADD COLUMN IF NOT EXISTS featured_slots jsonb NOT NULL DEFAULT '[null,null,null,null]'::jsonb;

CREATE OR REPLACE FUNCTION public.item_order_counts()
RETURNS TABLE (menu_item_id uuid, orders_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (el->>'id')::uuid AS menu_item_id,
         SUM(COALESCE((el->>'qty')::int, 1))::bigint AS orders_count
  FROM public.orders o
  CROSS JOIN LATERAL jsonb_array_elements(o.items) AS el
  WHERE (el->>'id') ~ '^[0-9a-fA-F-]{36}$'
  GROUP BY 1
$$;

GRANT EXECUTE ON FUNCTION public.item_order_counts() TO anon, authenticated, service_role;