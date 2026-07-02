CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(_user_id = auth.uid(), false)
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Keep the old public function defined for compatibility, but do not expose it to API roles.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(_user_id = auth.uid(), false)
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM service_role;

-- Storage image permissions.
DROP POLICY IF EXISTS "menu-images public read" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin insert" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin update" ON storage.objects;
DROP POLICY IF EXISTS "menu-images admin delete" ON storage.objects;

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
  AND app_private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "menu-images admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND app_private.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'menu-images'
  AND app_private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "menu-images admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND app_private.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Menu/admin table permissions.
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage items" ON public.menu_items;
CREATE POLICY "Admins manage items"
ON public.menu_items
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage options" ON public.menu_item_options;
CREATE POLICY "Admins manage options"
ON public.menu_item_options
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage offers" ON public.offers;
CREATE POLICY "Admins manage offers"
ON public.offers
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage theme" ON public.theme_settings;
CREATE POLICY "Admins manage theme"
ON public.theme_settings
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));