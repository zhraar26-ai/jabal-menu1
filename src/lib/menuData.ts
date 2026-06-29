import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  tag: string | null;
  sort_order: number;
  visible: boolean;
  image_url: string | null;
};


export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  sort_order: number;
  available: boolean;
};

export type Offer = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  active: boolean;
  sort_order: number;
};

export type ThemeSettings = {
  id: number;
  forest_color: string;
  forest_deep_color: string;
  gold_color: string;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  background_style: string;
  font_family: string;
};

const sb = supabase as any;

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await sb
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchOffers(activeOnly = false): Promise<Offer[]> {
  let q = sb.from("offers").select("*").order("sort_order", { ascending: true });
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchTheme(): Promise<ThemeSettings | null> {
  const { data, error } = await sb
    .from("theme_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export const BACKGROUND_STYLES: Record<string, string> = {
  "gold-lines":
    "radial-gradient(ellipse at top, color-mix(in oklab, var(--gold) 7%, transparent), transparent 55%),radial-gradient(ellipse at bottom, color-mix(in oklab, var(--forest-deep) 90%, transparent), transparent 60%),repeating-linear-gradient(135deg, transparent 0, transparent 38px, color-mix(in oklab, var(--gold) 3.5%, transparent) 38px, color-mix(in oklab, var(--gold) 3.5%, transparent) 39px),repeating-linear-gradient(45deg, transparent 0, transparent 38px, color-mix(in oklab, var(--gold) 2.5%, transparent) 38px, color-mix(in oklab, var(--gold) 2.5%, transparent) 39px),linear-gradient(180deg, var(--forest-deep), var(--forest) 45%, var(--forest-deep))",
  dots: "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 50%),radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 55%),radial-gradient(circle, color-mix(in oklab, var(--gold) 9%, transparent) 1px, transparent 1.5px) 0 0/24px 24px,linear-gradient(180deg, var(--forest-deep), var(--forest))",
  waves:
    "radial-gradient(ellipse at top, color-mix(in oklab, var(--gold) 10%, transparent), transparent 60%),repeating-radial-gradient(circle at 50% 120%, color-mix(in oklab, var(--gold) 4%, transparent) 0 1px, transparent 1px 60px),linear-gradient(180deg, var(--forest-deep), var(--forest))",
  plain: "linear-gradient(180deg, var(--forest-deep), var(--forest) 50%, var(--forest-deep))",
};

export const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "Lemonada", label: "Lemonada (افتراضي)" },
  { value: "Cairo", label: "Cairo" },
  { value: "Tajawal", label: "Tajawal" },
  { value: "Almarai", label: "Almarai" },
  { value: "Amiri", label: "Amiri (كلاسيكي)" },
  { value: "Rakkas", label: "Rakkas (عريض)" },
  { value: "Noto Kufi Arabic", label: "Noto Kufi" },
  { value: "Reem Kufi", label: "Reem Kufi" },
];

export function applyTheme(t: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--forest", t.forest_color);
  root.style.setProperty("--forest-deep", t.forest_deep_color);
  root.style.setProperty("--gold", t.gold_color);
  const bg = BACKGROUND_STYLES[t.background_style] ?? BACKGROUND_STYLES["gold-lines"];
  document.body.style.backgroundImage = bg;
  if (t.font_family) {
    const stack = `"${t.font_family}", "Lemonada", system-ui, sans-serif`;
    root.style.setProperty("--font-sans", stack);
    root.style.setProperty("--font-display", stack);
    document.body.style.fontFamily = stack;
  }
}
