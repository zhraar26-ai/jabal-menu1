-- Ensure the admin role-check function runs with owner privileges and a safe search path.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Allow all API roles that may evaluate RLS policies to execute the role-check function.
GRANT USAGE ON TYPE public.app_role TO public, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public, anon, authenticated, service_role;

-- Keep Data API grants aligned with the admin/public RLS policies.
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;

GRANT SELECT ON public.menu_item_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_item_options TO authenticated;
GRANT ALL ON public.menu_item_options TO service_role;

GRANT SELECT ON public.offers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;

GRANT SELECT ON public.theme_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.theme_settings TO authenticated;
GRANT ALL ON public.theme_settings TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Replace duplicated/older storage policies with one clean set for the menu-images bucket.
DROP POLICY IF EXISTS "Admins upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Public read menu images" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin write" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin update" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin delete" ON storage.objects;
DROP POLICY IF EXISTS "menu-images public read" ON storage.objects;

CREATE POLICY "menu-images public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

CREATE POLICY "menu-images admin insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "menu-images admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'menu-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "menu-images admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Recreate core admin/public policies for the menu content tables idempotently.
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
ON public.categories
FOR SELECT
TO public
USING (true);
CREATE POLICY "Admins manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage items" ON public.menu_items;
DROP POLICY IF EXISTS "Public read items" ON public.menu_items;
CREATE POLICY "Public read items"
ON public.menu_items
FOR SELECT
TO public
USING (true);
CREATE POLICY "Admins manage items"
ON public.menu_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage options" ON public.menu_item_options;
DROP POLICY IF EXISTS "Public read options" ON public.menu_item_options;
CREATE POLICY "Public read options"
ON public.menu_item_options
FOR SELECT
TO public
USING (true);
CREATE POLICY "Admins manage options"
ON public.menu_item_options
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage offers" ON public.offers;
DROP POLICY IF EXISTS "Public read offers" ON public.offers;
CREATE POLICY "Public read offers"
ON public.offers
FOR SELECT
TO public
USING (true);
CREATE POLICY "Admins manage offers"
ON public.offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins insert theme" ON public.theme_settings;
DROP POLICY IF EXISTS "Admins update theme" ON public.theme_settings;
DROP POLICY IF EXISTS "Public read theme" ON public.theme_settings;
CREATE POLICY "Public read theme"
ON public.theme_settings
FOR SELECT
TO public
USING (true);
CREATE POLICY "Admins manage theme"
ON public.theme_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));