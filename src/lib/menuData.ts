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
  created_at?: string | null;
  featured?: boolean;
};

export type Offer = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  active: boolean;
  sort_order: number;
};

export type MenuItemOption = {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
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
  footer_text: string;
  location_url: string;
  featured_enabled?: boolean;
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

export async function fetchMenuItemOptions(): Promise<MenuItemOption[]> {
  const { data, error } = await sb
    .from("menu_item_options")
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

/* ============ DELIVERY / RATINGS / ORDERS ============ */

export type DeliveryArea = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  sort_order: number;
};

export type DishRating = {
  id: string;
  menu_item_id: string;
  stars: number;
  hidden: boolean;
  created_at: string;
};

export type RestaurantRating = {
  id: string;
  stars: number;
  comment: string | null;
  hidden: boolean;
  pinned?: boolean;
  created_at: string;
};


export type OrderRow = {
  id: string;
  items: any;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_area: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export async function fetchDeliveryAreas(activeOnly = false): Promise<DeliveryArea[]> {
  let q = sb.from("delivery_areas").select("*").order("sort_order", { ascending: true });
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchDishRatings(): Promise<DishRating[]> {
  const { data, error } = await sb
    .from("dish_ratings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRestaurantRatings(): Promise<RestaurantRating[]> {
  const { data, error } = await sb
    .from("restaurant_ratings")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}


export async function submitDishRating(menuItemId: string, stars: number) {
  const { error } = await sb
    .from("dish_ratings")
    .insert({ menu_item_id: menuItemId, stars: Math.min(5, Math.max(1, Math.round(stars))) });
  if (error) throw error;
}

export async function submitRestaurantRating(stars: number, comment: string) {
  const { error } = await sb.from("restaurant_ratings").insert({
    stars: Math.min(5, Math.max(1, Math.round(stars))),
    comment: comment ? comment.slice(0, 500) : null,
  });
  if (error) throw error;
}

export async function logOrder(payload: {
  items: any;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_area: string | null;
  phone: string;
  address: string;
}) {
  const { error } = await sb.from("orders").insert({
    ...payload,
    phone: payload.phone.slice(0, 40),
    address: payload.address.slice(0, 500),
  });
  if (error) throw error;
}

/* ============ SECURITY HELPERS ============ */

/** Strips HTML/script-ish characters from free-text customer input (XSS hardening). */
export function sanitizeText(input: string, max = 200): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/\s{3,}/g, "  ")
    .trim()
    .slice(0, max);
}

/** Simple client-side throttle to stop spam submissions. */
export function rateLimit(key: string, minIntervalMs: number, maxPerHour = 20): string | null {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  const storeKey = `rl:${key}`;
  let hits: number[] = [];
  try {
    hits = JSON.parse(localStorage.getItem(storeKey) || "[]");
  } catch {
    hits = [];
  }
  hits = hits.filter((t) => now - t < 60 * 60 * 1000);
  const last = hits[hits.length - 1];
  if (last && now - last < minIntervalMs) {
    return `يرجى الانتظار ${Math.ceil((minIntervalMs - (now - last)) / 1000)} ثانية قبل المحاولة مرة أخرى.`;
  }
  if (hits.length >= maxPerHour) {
    return "تم تجاوز الحد المسموح من المحاولات، حاول لاحقاً.";
  }
  hits.push(now);
  localStorage.setItem(storeKey, JSON.stringify(hits));
  return null;
}

/* ============ LOCAL STORAGE (favorites / address) ============ */

const FAV_KEY = "jabal:favorites";
const ADDR_KEY = "jabal:address";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export type SavedAddress = { areaId: string; phone: string; address: string };

export function loadSavedAddress(): SavedAddress | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(ADDR_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAddress(v: SavedAddress) {
  try {
    localStorage.setItem(ADDR_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}
