ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS original_price integer,
  ADD COLUMN IF NOT EXISTS discount_price integer,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;