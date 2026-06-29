
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.theme_settings
  ADD COLUMN IF NOT EXISTS footer_text text NOT NULL DEFAULT 'مطعم جبل 2026 — جميع الحقوق محفوظة';
