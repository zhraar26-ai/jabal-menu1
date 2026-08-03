-- DELIVERY AREAS
CREATE TABLE public.delivery_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_areas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_areas TO authenticated;
GRANT ALL ON public.delivery_areas TO service_role;
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read delivery areas" ON public.delivery_areas FOR SELECT USING (true);
CREATE POLICY "Admins manage delivery areas" ON public.delivery_areas FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

-- DISH RATINGS
CREATE TABLE public.dish_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dish_ratings_item_idx ON public.dish_ratings(menu_item_id);
GRANT SELECT, INSERT ON public.dish_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dish_ratings TO authenticated;
GRANT ALL ON public.dish_ratings TO service_role;
ALTER TABLE public.dish_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible dish ratings" ON public.dish_ratings FOR SELECT USING (hidden = false);
CREATE POLICY "Anyone can rate a dish" ON public.dish_ratings FOR INSERT WITH CHECK (hidden = false);
CREATE POLICY "Admins manage dish ratings" ON public.dish_ratings FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

-- RESTAURANT RATINGS
CREATE TABLE public.restaurant_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.restaurant_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_ratings TO authenticated;
GRANT ALL ON public.restaurant_ratings TO service_role;
ALTER TABLE public.restaurant_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible restaurant ratings" ON public.restaurant_ratings FOR SELECT USING (hidden = false);
CREATE POLICY "Anyone can rate the restaurant" ON public.restaurant_ratings FOR INSERT WITH CHECK (hidden = false AND (comment IS NULL OR length(comment) <= 500));
CREATE POLICY "Admins manage restaurant ratings" ON public.restaurant_ratings FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

-- ORDERS (logged when a customer sends the cart to WhatsApp)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal integer NOT NULL DEFAULT 0,
  delivery_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  delivery_area text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_idx ON public.orders(created_at DESC);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT WITH CHECK (
  total >= 0 AND length(coalesce(phone,'')) <= 40 AND length(coalesce(address,'')) <= 500
);
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));