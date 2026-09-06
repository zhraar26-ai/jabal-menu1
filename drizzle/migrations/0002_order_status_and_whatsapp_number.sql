ALTER TABLE public.theme_settings
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '9647878777237';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent';

CREATE OR REPLACE FUNCTION public.orders_validate_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('sent','on_way','delivered') THEN
    RAISE EXCEPTION 'invalid order status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_validate_status_trg ON public.orders;
CREATE TRIGGER orders_validate_status_trg
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_validate_status();