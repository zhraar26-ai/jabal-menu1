CREATE INDEX IF NOT EXISTS menu_items_category_available_idx
  ON public.menu_items (category_id, available, sort_order);

CREATE INDEX IF NOT EXISTS menu_items_featured_idx
  ON public.menu_items (featured, available, sort_order)
  WHERE featured = true;

CREATE INDEX IF NOT EXISTS menu_item_options_item_idx
  ON public.menu_item_options (menu_item_id, sort_order);