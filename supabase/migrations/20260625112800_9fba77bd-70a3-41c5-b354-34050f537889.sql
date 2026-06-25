
-- Fix security warnings: revoke execute from public/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_first_admin() FROM PUBLIC, anon, authenticated;

-- Storage policies for menu-images bucket
CREATE POLICY "Public read menu images" ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

CREATE POLICY "Admins upload menu images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update menu images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete menu images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));

-- Seed initial categories and items
INSERT INTO public.categories (name, tag, sort_order) VALUES
('بيتزا', 'إيطالي أصيل', 1),
('برغر', 'محضّر طازج', 2),
('ستيك', 'مشوي على الفحم', 3),
('دولمة', 'تراث عراقي', 4),
('شاورما', 'على الفحم', 5),
('إيطالي', 'باستا وريزوتو', 6),
('مقبلات', 'للبداية المثالية', 7);

-- Sample items per category
INSERT INTO public.menu_items (category_id, name, description, price, sort_order)
SELECT c.id, x.name, x.description, x.price, x.s
FROM public.categories c
JOIN (VALUES
  ('بيتزا', 'مارغريتا', 'صلصة طماطم، موزاريلا، ريحان طازج', 9000, 1),
  ('بيتزا', 'بيبروني', 'بيبروني حار مع موزاريلا مذابة', 11000, 2),
  ('برغر', 'كلاسيك برغر', 'لحم بقري مشوي، جبن شيدر، خس، طماطم', 8000, 1),
  ('برغر', 'دبل تشيز', 'قطعتين لحم مع جبن مضاعف', 12000, 2),
  ('ستيك', 'ستيك ريب آي', 'ستيك فاخر مع خضار مشوي', 28000, 1),
  ('دولمة', 'دولمة عراقية', 'ورق عنب، باذنجان، فلفل، كوسا', 10000, 1),
  ('شاورما', 'شاورما دجاج', 'دجاج متبّل مع ثوم وبطاطا', 6000, 1),
  ('شاورما', 'شاورما لحم', 'لحم على الفحم مع طحينة', 7000, 2),
  ('إيطالي', 'باستا ألفريدو', 'كريمة، جبن بارميزان، دجاج', 11000, 1),
  ('مقبلات', 'حمص بالطحينة', 'حمص كريمي مع زيت زيتون', 4000, 1),
  ('مقبلات', 'بطاطا مقلية', 'بطاطا ذهبية مقرمشة', 3500, 2)
) AS x(cat, name, description, price, s) ON c.name = x.cat;
