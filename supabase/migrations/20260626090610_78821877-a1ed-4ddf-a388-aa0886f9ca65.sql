
ALTER TABLE public.theme_settings ADD COLUMN IF NOT EXISTS font_family text NOT NULL DEFAULT 'Lemonada';

DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_first_admin();

DO $$
DECLARE first_uid uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN
    SELECT id INTO first_uid FROM auth.users ORDER BY created_at ASC LIMIT 1;
    IF first_uid IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (first_uid, 'admin')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;
