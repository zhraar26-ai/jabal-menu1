ALTER TABLE public.theme_settings
  ADD COLUMN IF NOT EXISTS opening_hours jsonb NOT NULL DEFAULT '[
    {"open":"12:00","close":"02:00","closed":false},
    {"open":"12:00","close":"02:00","closed":false},
    {"open":"12:00","close":"02:00","closed":false},
    {"open":"12:00","close":"02:00","closed":false},
    {"open":"12:00","close":"02:00","closed":false},
    {"open":"12:00","close":"02:00","closed":false},
    {"open":"12:00","close":"02:00","closed":false}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS manual_closed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS closed_message text NOT NULL DEFAULT 'المطعم مغلق حالياً، نستقبل طلباتكم خلال أوقات العمل';