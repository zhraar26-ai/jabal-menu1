
-- 1) Fix has_role: SECURITY DEFINER + grants
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 2) Storage: menu-images bucket policies (public read + admin write)
DROP POLICY IF EXISTS "menu-images public read" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin write" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin update" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin delete" ON storage.objects;

CREATE POLICY "menu-images public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

CREATE POLICY "menu-images admin write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "menu-images admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "menu-images admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));

-- 3) menu_item_options table
CREATE TABLE IF NOT EXISTS public.menu_item_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.menu_item_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_item_options TO authenticated;
GRANT ALL ON public.menu_item_options TO service_role;

ALTER TABLE public.menu_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_options REPLICA IDENTITY FULL;

CREATE POLICY "Public read options"
ON public.menu_item_options FOR SELECT
TO public USING (true);

CREATE POLICY "Admins manage options"
ON public.menu_item_options FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS menu_item_options_item_idx ON public.menu_item_options(menu_item_id);
