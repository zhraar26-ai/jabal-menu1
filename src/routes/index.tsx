import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Phone,
  MapPin,
  Instagram,
  MessageCircle,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  Menu as MenuIcon,
  X,
  UtensilsCrossed,
  Trash2,
  Sparkles,
  ChevronDown,
  Search,
  Heart,
  Star,
} from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import {
  Category,
  DeliveryArea,
  DishRating,
  MenuItem,
  MenuItemOption,
  Offer,
  RestaurantRating,
  ThemeSettings,
  applyTheme,
  fetchCategories,
  fetchDeliveryAreas,
  fetchDishRatings,
  fetchMenuItems,
  fetchMenuItemOptions,
  fetchFeaturedItems,
  fetchItemsByCategory,
  fetchCategoryCounts,
  fetchOptionsForItems,

  fetchOffers,
  fetchRestaurantRatings,
  fetchTheme,
  loadFavorites,
  loadSavedAddress,
  isStoreOpen,
  checkOrderGuard,
  logOrder,
  rateLimit,
  sanitizeText,
  saveAddress,
  saveFavorites,
  submitDishRating,
  submitRestaurantRating,
} from "@/lib/menuData";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مطعم جبل | Jabal Restaurant - نكهات غريبة بطعم مختلف" },
      {
        name: "description",
        content:
          "مطعم جبل في البصرة - تجربة طعام راقية تجمع بين الفن الغربي والذوق الشرقي.",
      },
      { property: "og:title", content: "مطعم جبل | Jabal Restaurant" },
      {
        property: "og:description",
        content: "نكهات غريبة بطعم مختلف - مطعم جبل في البصرة",
      },
    ],
  }),
  component: HomePage,
});

const WHATSAPP = "https://wa.me/9647878777237";
const TIKTOK_URL = "https://www.tiktok.com/@jeepl25";
const PHONE_PRIMARY = "07878777237";
const PHONE_SECONDARY = "07756000241";
const ADDRESS_FULL = "البصرة - أبي الخصيب، فلكة التجنيد مجاور جاليري مول";
const ITEM_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='%23042c08'/><stop offset='1' stop-color='%23021805'/></linearGradient></defs><rect width='800' height='450' fill='url(%23g)'/><text x='50%' y='52%' font-family='serif' font-size='42' fill='%23ffbd59' text-anchor='middle' opacity='0.55'>مطعم جبل</text></svg>`,
  );

const NAV_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#menu", label: "أقسام المنيو" },
  { href: "#about", label: "عن المطعم" },
  { href: "#contact", label: "تواصل" },
];

const SIDE_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#about", label: "عن المطعم" },
  { href: "#menu", label: "أقسام المنيو" },
  { href: "#featured", label: "🔥 الأكثر طلباً" },
];

function SkeletonBar({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`menu-skeleton block rounded-full ${className}`} />;
}

function CategorySkeleton() {
  return (
    <div className="glass-card flex min-h-[154px] flex-col items-center justify-center gap-3 rounded-2xl px-4 py-5 md:min-h-[190px] md:rounded-3xl md:py-7">
      <span className="menu-skeleton block h-16 w-16 rounded-full md:h-20 md:w-20" />
      <SkeletonBar className="h-4 w-24 md:h-5 md:w-32" />
      <SkeletonBar className="h-2.5 w-12" />
    </div>
  );
}

function OfferSkeleton() {
  return (
    <div className="glass-card min-h-[132px] rounded-3xl p-5">
      <SkeletonBar className="h-5 w-20" />
      <SkeletonBar className="mt-5 h-5 w-2/3" />
      <SkeletonBar className="mt-3 h-3 w-full" />
      <SkeletonBar className="mt-2 h-3 w-4/5" />
    </div>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl md:rounded-3xl">
      <div className="menu-skeleton aspect-[4/3] w-full" />
      <div className="space-y-3 p-3 md:p-4">
        <SkeletonBar className="h-4 w-2/3 md:h-5" />
        <SkeletonBar className="h-4 w-24" />
        <SkeletonBar className="h-3 w-28" />
        <SkeletonBar className="h-8 w-full rounded-xl" />
        <SkeletonBar className="h-9 w-full" />
      </div>
    </div>
  );
}

function DishCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="menu-skeleton aspect-[16/10] w-full" />
      <div className="space-y-4 p-4 md:p-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex-1 space-y-2.5">
            <SkeletonBar className="h-5 w-2/3" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-5 w-28" />
          </div>
          <div className="w-24 space-y-2">
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-7 w-20" />
          </div>
        </div>
        <SkeletonBar className="h-10 w-full rounded-xl" />
        <SkeletonBar className="h-11 w-full" />
        <SkeletonBar className="h-11 w-full" />
      </div>
    </div>
  );
}

function MenuImage({
  src,
  alt,
  className,
  onClick,
  width = 520,
}: {
  src: string | null;
  alt: string;
  className: string;
  onClick?: () => void;
  width?: number;
}) {
  const original = src || ITEM_PLACEHOLDER;
  const optimized = optimizedImage(original, width) || original;
  const [currentSrc, setCurrentSrc] = useState(optimized);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrentSrc(optimized);
    setReady(false);
  }, [optimized]);

  return (
    <>
      {!ready && <span aria-hidden="true" className="menu-skeleton absolute inset-0 block" />}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onLoad={() => setReady(true)}
        onError={() => {
          // transformer can refuse very large sources → fall back to the original file
          if (currentSrc !== original) setCurrentSrc(original);
          else if (currentSrc !== ITEM_PLACEHOLDER) setCurrentSrc(ITEM_PLACEHOLDER);
          else setReady(true);
        }}
        onClick={onClick}
        className={`${className} transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}



/** 5-star display / picker */
function Stars({
  value,
  size = "sm",
  onPick,
}: {
  value: number;
  size?: "sm" | "lg";
  onPick?: (n: number) => void;
}) {
  const cls = size === "lg" ? "h-9 w-9" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onPick}
          onClick={onPick ? () => onPick(n) : undefined}
          aria-label={`${n} نجوم`}
          className={onPick ? "transition-transform hover:scale-110" : "cursor-default"}
        >
          <Star
            className={`${cls} ${n <= value ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--gold)]/40"}`}
          />
        </button>
      ))}
    </span>
  );
}

type CartLine = {
  itemId: string;
  optionId: string | null;
  optionName: string | null;
  unitPrice: number;
  qty: number;
  note: string;
};


function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [options, setOptions] = useState<MenuItemOption[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [openingCategory, setOpeningCategory] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNowTick(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const [pendingQty, setPendingQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  // per item: selected option id (or "" = base price)
  const [selectedOption, setSelectedOption] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<Record<string, CartLine>>({});

  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showCheckoutWarning, setShowCheckoutWarning] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [featOpen, setFeatOpen] = useState(true);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviews, setReviews] = useState<RestaurantRating[]>([]);


  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // favorites (localStorage, no auth)
  const [favorites, setFavorites] = useState<string[]>([]);
  // ratings
  const [ratings, setRatings] = useState<DishRating[]>([]);
  const [rateTarget, setRateTarget] = useState<{ type: "dish" | "restaurant"; id?: string; name: string } | null>(null);
  const [rateStars, setRateStars] = useState(0);

  // delivery
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [areaId, setAreaId] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);

  const toggleCat = (id: string) => setOpenCat((cur) => (cur === id ? null : id));
  useEffect(() => {
    if (!openCat) {
      setOpeningCategory(null);
      return;
    }
    setOpeningCategory(openCat);
    const timer = window.setTimeout(() => setOpeningCategory(null), 320);
    return () => window.clearTimeout(timer);
  }, [openCat]);
  const closeCat = (id: string) => {
    setOpenCat(null);
    requestAnimationFrame(() => {
      document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const isNewItem = (it: MenuItem) => {
    if (!it.created_at) return false;
    return Date.now() - new Date(it.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;
  };

  const toggleFav = (id: string) =>
    setFavorites((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      saveFavorites(next);
      return next;
    });

  /* ---------- staged, on-demand data loading ---------- */
  const loadedCatsRef = useRef<Set<string>>(new Set());
  const allItemsRef = useRef(false);
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});
  const [loadingCat, setLoadingCat] = useState<string | null>(null);

  const mergeItems = (incoming: MenuItem[]) =>
    setItems((cur) => {
      const map = new Map(cur.map((i) => [i.id, i] as const));
      for (const it of incoming) map.set(it.id, it);
      return Array.from(map.values()).sort((a, b) => a.sort_order - b.sort_order);
    });

  const mergeOptions = (incoming: MenuItemOption[]) =>
    setOptions((cur) => {
      const map = new Map(cur.map((o) => [o.id, o] as const));
      for (const o of incoming) map.set(o.id, o);
      return Array.from(map.values());
    });

  const loadCategoryItems = async (catId: string) => {
    if (allItemsRef.current || loadedCatsRef.current.has(catId)) return;
    loadedCatsRef.current.add(catId);
    setLoadingCat(catId);
    try {
      const rows = await fetchItemsByCategory(catId);
      mergeItems(rows);
      mergeOptions(await fetchOptionsForItems(rows.map((r) => r.id)));
    } catch (e) {
      loadedCatsRef.current.delete(catId);
      console.error(e);
    } finally {
      setLoadingCat((c) => (c === catId ? null : c));
    }
  };

  /** Full menu — only needed for search / favorites; loaded when the browser is idle. */
  const ensureAllItems = async () => {
    if (allItemsRef.current) return;
    allItemsRef.current = true;
    try {
      const [all, opts] = await Promise.all([fetchMenuItems(), fetchMenuItemOptions()]);
      mergeItems(all);
      mergeOptions(opts);
    } catch (e) {
      allItemsRef.current = false;
      console.error(e);
    }
  };

  /** First paint: categories + theme + offers + featured only (tiny payload). */
  const loadCritical = async () => {
    const results = await Promise.allSettled([
      fetchCategories().then(setCategories),
      fetchFeaturedItems().then(mergeItems),
      fetchCategoryCounts().then(setCatCounts),
      fetchOffers(true).then(setOffers),
      fetchTheme().then((t) => {
        if (t) {
          setTheme(t);
          applyTheme(t);
        }
      }),
    ]);
    results.forEach((r) => r.status === "rejected" && console.error(r.reason));
    setMenuLoading(false);
  };

  /** Everything else, after the menu is interactive. */
  const loadSecondary = async () => {
    const results = await Promise.allSettled([
      fetchDeliveryAreas(true).then(setAreas),
      fetchDishRatings().then(setRatings),
      fetchRestaurantRatings().then(setReviews),
    ]);
    results.forEach((r) => r.status === "rejected" && console.error(r.reason));
  };


  // restore local prefs
  useEffect(() => {
    setFavorites(loadFavorites());
    const saved = loadSavedAddress();
    if (saved) {
      setAreaId(saved.areaId ?? "");
      setCustomerPhone(saved.phone ?? "");
      setCustomerAddress(saved.address ?? "");
    }
  }, []);

  /* warm the browser cache only for what is already on screen */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urls = categories.map((c) => c.image_url).filter(Boolean) as string[];
    urls.forEach((u) => {
      const img = new Image();
      img.decoding = "async";
      img.src = u;
    });
  }, [categories]);

  /* load a category's dishes on demand */
  useEffect(() => {
    if (openCat) loadCategoryItems(openCat);
  }, [openCat]);

  /* searching needs the whole menu */
  useEffect(() => {
    if (searchOpen || query.trim() || favDrawerOpen) ensureAllItems();
  }, [searchOpen, query, favDrawerOpen]);

  useEffect(() => {
    let idle: number | undefined;
    loadCritical().then(() => {
      const run = () => {
        loadSecondary();
        ensureAllItems();
      };
      const ric = (window as any).requestIdleCallback;
      if (typeof ric === "function") idle = ric(run, { timeout: 2500 });
      else idle = window.setTimeout(run, 800);
    });

    const sb = supabase as any;
    const refreshItems = () => {
      allItemsRef.current = false;
      loadedCatsRef.current.clear();
      fetchCategoryCounts().then(setCatCounts).catch(console.error);
      ensureAllItems();
    };
    const channel = sb
      .channel("menu-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        fetchCategories().then(setCategories).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, refreshItems)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_item_options" }, () =>
        fetchMenuItemOptions().then(setOptions).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () =>
        fetchOffers(true).then(setOffers).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_areas" }, () =>
        fetchDeliveryAreas(true).then(setAreas).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "dish_ratings" }, () =>
        fetchDishRatings().then(setRatings).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_ratings" }, () =>
        fetchRestaurantRatings().then(setReviews).catch(console.error),
      )

      .on("postgres_changes", { event: "*", schema: "public", table: "theme_settings" }, () =>
        fetchTheme()
          .then((t) => {
            if (t) {
              setTheme(t);
              applyTheme(t);
            }
          })
          .catch(console.error),
      )
      .subscribe();

    return () => {
      if (idle !== undefined) {
        const cic = (window as any).cancelIdleCallback;
        if (typeof cic === "function") cic(idle);
        else window.clearTimeout(idle);
      }
      sb.removeChannel(channel);
    };
  }, []);


  const optionsByItem = useMemo(() => {
    const m: Record<string, MenuItemOption[]> = {};
    for (const o of options) (m[o.menu_item_id] ||= []).push(o);
    return m;
  }, [options]);

  const itemsByCat = useMemo(() => {
    const m: Record<string, MenuItem[]> = {};
    for (const c of categories) m[c.id] = [];
    for (const it of items) {
      if (!it.available) continue;
      (m[it.category_id] ||= []).push(it);
    }
    return m;
  }, [categories, items]);

  const featuredItems = useMemo(
    () => items.filter((it) => it.available && (it as any).featured),
    [items],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (it) =>
        it.available &&
        (it.name.toLowerCase().includes(q) ||
          (it.description ?? "").toLowerCase().includes(q)),
    );
  }, [items, query]);

  const favoriteItems = useMemo(
    () => items.filter((it) => it.available && favorites.includes(it.id)),
    [items, favorites],
  );

  const ratingByItem = useMemo(() => {
    const m: Record<string, { avg: number; count: number }> = {};
    const acc: Record<string, number[]> = {};
    for (const r of ratings) {
      if (r.hidden) continue;
      (acc[r.menu_item_id] ||= []).push(r.stars);
    }
    for (const [id, arr] of Object.entries(acc)) {
      m[id] = { avg: arr.reduce((a, b) => a + b, 0) / arr.length, count: arr.length };
    }
    return m;
  }, [ratings]);

  /** avg rating + "rate dish" trigger, rendered under every dish card */
  const ratingLine = (item: MenuItem) => {
    const r = ratingByItem[item.id];
    return (
      <div className="flex flex-col items-start gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs text-foreground/75">
          <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          {r ? (
            <>
              <span className="font-bold text-[var(--gold)]">{r.avg.toFixed(1)}</span>
              <span className="text-foreground/50">({r.count})</span>
            </>
          ) : (
            <span className="text-foreground/50">لا يوجد تقييم</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setRateTarget({ type: "dish", id: item.id, name: item.name })}
          className="rounded-full gold-border px-2.5 py-1 text-[11px] font-bold text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
        >
          ✍️ قَيّم الطبق
        </button>
      </div>
    );
  };

  /** heart favorite toggle, positioned inside the image wrapper */
  const favButton = (item: MenuItem) => {
    const active = favorites.includes(item.id);
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleFav(item.id);
        }}
        aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        className="absolute bottom-2 left-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-[var(--forest-deep)]/80 backdrop-blur transition-transform hover:scale-110"
      >
        <Heart
          className={`h-4.5 w-4.5 ${active ? "fill-red-500 text-red-500" : "text-[var(--gold)]"}`}
        />
      </button>
    );
  };


  const itemById = useMemo(() => {
    const m: Record<string, MenuItem> = {};
    for (const it of items) m[it.id] = it;
    return m;
  }, [items]);

  const basePrice = (it: MenuItem) =>
    it.discount_price != null && it.discount_price < it.price ? it.discount_price : it.price;

  const priceForSelection = (it: MenuItem) => {
    const opts = optionsByItem[it.id] ?? [];
    const selId = selectedOption[it.id];
    if (opts.length > 0) {
      const chosen = opts.find((o) => o.id === selId) ?? opts[0];
      return { price: chosen.price, option: chosen };
    }
    return { price: basePrice(it), option: null as MenuItemOption | null };
  };

  const getPending = (key: string) => pendingQty[key] ?? 1;
  const setPending = (key: string, delta: number) =>
    setPendingQty((q) => ({ ...q, [key]: Math.max(1, (q[key] ?? 1) + delta) }));

  const cartKey = (itemId: string, optionId: string | null) =>
    `${itemId}__${optionId ?? "base"}`;

  const setCartQty = (key: string, delta: number) =>
    setCart((c) => {
      const cur = c[key];
      if (!cur) return c;
      const next = cur.qty + delta;
      const copy = { ...c };
      if (next <= 0) delete copy[key];
      else copy[key] = { ...cur, qty: next };
      return copy;
    });

  const removeFromCart = (key: string) =>
    setCart((c) => {
      const copy = { ...c };
      delete copy[key];
      return copy;
    });

  const setCartNote = (key: string, note: string) =>
    setCart((c) => {
      const cur = c[key];
      if (!cur) return c;
      return { ...c, [key]: { ...cur, note } };
    });

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b.qty, 0),
    [cart],
  );

  const cartEntries = useMemo(() => {
    const entries: { key: string; item: MenuItem; line: CartLine }[] = [];
    for (const [key, line] of Object.entries(cart)) {
      const it = itemById[line.itemId];
      if (it && line.qty > 0) entries.push({ key, item: it, line });
    }
    return entries;
  }, [cart, itemById]);

  const cartTotal = useMemo(
    () => cartEntries.reduce((s, e) => s + e.line.unitPrice * e.line.qty, 0),
    [cartEntries],
  );

  const selectedArea = useMemo(
    () => areas.find((a) => a.id === areaId) ?? null,
    [areas, areaId],
  );
  const deliveryFee = selectedArea?.price ?? 0;
  const grandTotal = cartTotal + deliveryFee;
  const storeOpen = isStoreOpen(theme, nowTick);
  const closedMessage =
    theme?.closed_message || "المطعم مغلق حالياً، نستقبل طلباتكم خلال أوقات العمل";
  const canCheckout =
    storeOpen && (areas.length === 0 || !!areaId) && customerPhone.trim().length >= 8;


  const addToCart = (item: MenuItem) => {
    const qty = getPending(item.id);
    const note = sanitizeText(notes[item.id] ?? "");
    const { price, option } = priceForSelection(item);
    const key = cartKey(item.id, option?.id ?? null);
    setCart((c) => {
      const existing = c[key];
      return {
        ...c,
        [key]: {
          itemId: item.id,
          optionId: option?.id ?? null,
          optionName: option?.name ?? null,
          unitPrice: price,
          qty: (existing?.qty ?? 0) + qty,
          note: note || existing?.note || "",
        },
      };
    });
    setPendingQty((q) => ({ ...q, [item.id]: 1 }));
    setJustAdded(item.id);
    setTimeout(() => setJustAdded((j) => (j === item.id ? null : j)), 1200);
  };

  const sendCartToWhatsapp = async () => {
    setOrderError(null);
    const phone = sanitizeText(customerPhone, 40);
    const address = sanitizeText(customerAddress, 500);
    if (!storeOpen) {
      setOrderError(closedMessage);
      return;
    }
    if (!canCheckout) {
      setShowCheckoutWarning(true);
      return;
    }

    const signature = JSON.stringify({
      lines: cartEntries.map((e) => [e.key, e.line.qty, e.line.unitPrice, e.line.note]),
      areaId,
      phone,
      address,
    });
    const limited = checkOrderGuard(signature);
    if (limited) {
      setOrderError(limited);
      return;
    }
    saveAddress({ areaId, phone, address });

    const lines = cartEntries.map((e) => {
      const label = e.line.optionName ? `${e.item.name} (${e.line.optionName})` : e.item.name;
      const note = sanitizeText(e.line.note);
      const noteLine = note ? `\n   ملاحظة: ${note}` : "";
      return `• ${label} × ${e.line.qty} = ${(e.line.unitPrice * e.line.qty).toLocaleString()} د.ع${noteLine}`;
    });
    const areaLine = selectedArea
      ? `منطقة التوصيل: ${selectedArea.name} (${selectedArea.price.toLocaleString()} د.ع)\n`
      : "";
    const text =
      `مرحبا، طلب جديد من منيو جبل الإلكتروني:\n\n${lines.join("\n")}\n\n` +
      `مجموع الأطباق: ${cartTotal.toLocaleString()} د.ع\n` +
      (selectedArea ? `التوصيل: ${deliveryFee.toLocaleString()} د.ع\n` : "") +
      `المجموع الكلي: ${grandTotal.toLocaleString()} د.ع\n\n` +
      areaLine +
      `رقم الهاتف: ${phone}\nالعنوان: ${address}`;

    logOrder({
      items: cartEntries.map((e) => ({
        id: e.item.id,
        name: e.item.name,
        option: e.line.optionName,
        qty: e.line.qty,
        unit_price: e.line.unitPrice,
      })),
      subtotal: cartTotal,
      delivery_fee: deliveryFee,
      total: grandTotal,
      delivery_area: selectedArea?.name ?? null,
      phone,
      address,
    }).catch(console.error);

    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };



  const heroSrc = theme?.hero_image_url || heroImg;
  const heroTitle = theme?.hero_title || "نكهات غريبة بطعم مختلف";
  const heroSubtitle =
    theme?.hero_subtitle ||
    "في مطعم جبل، نقدّم تجربة طعام تجمع بين الفن الغربي والذوق الشرقي، من الستيك المشوي إلى البيتزا الإيطالية، كل طبق يُحضّر بشغف ومكونات طازجة.";

  return (
    <div className="min-h-screen bg-[var(--forest)] text-foreground">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 border-b border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[color-mix(in_oklab,var(--forest-deep)_85%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
          <nav className="hidden flex-1 items-center gap-2 text-sm md:flex">
            {NAV_LINKS.map((l, idx) => (
              <span key={l.href} className="flex items-center gap-2">
                <a
                  href={l.href}
                  className="story-link text-foreground/85 transition-colors hover:text-[var(--gold)]"
                >
                  {l.label}
                </a>
                {idx < NAV_LINKS.length - 1 && (
                  <span className="text-[var(--gold)]/40">•</span>
                )}
              </span>
            ))}
          </nav>

          <a href="#home" className="flex shrink-0 items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
            <img src={logoImg} alt="مطعم جبل" width={44} height={44} className="h-11 w-11 rounded-full" />
            <span className="gold-text font-display text-lg font-bold md:text-xl">مطعم جبل</span>
          </a>

          <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                requestAnimationFrame(() => searchRef.current?.focus());
              }}
              aria-label="بحث"
              className="grid h-9 w-9 place-items-center rounded-full gold-border text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            <a
              href={`tel:${PHONE_PRIMARY}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3.5 py-1.5 text-xs font-bold text-[var(--forest-deep)] shadow-gold transition-transform hover:scale-105"
            >
              <Phone className="h-3.5 w-3.5" />
              اتصل للطلب
            </a>
            <button
              onClick={() => setNavOpen((v) => !v)}
              aria-label="القائمة"
              className="grid h-9 w-9 place-items-center rounded-full gold-border text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
            >
              {navOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>


          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                requestAnimationFrame(() => searchRef.current?.focus());
              }}
              aria-label="بحث"
              className="rounded-full gold-border p-2 text-[var(--gold)]"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="rounded-full gold-border p-2 text-[var(--gold)]"
              aria-label="القائمة"
            >
              {navOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* expanding search field */}
        <div
          className={`overflow-y-auto overscroll-contain border-t border-[color-mix(in_oklab,var(--gold)_15%,transparent)] bg-[var(--forest-deep)] transition-all duration-300 ${
            searchOpen ? "max-h-[75vh] opacity-100" : "max-h-0 overflow-hidden border-transparent opacity-0"
          }`}
        >
          <div className="mx-auto max-w-3xl px-4 py-2.5">
            <div className="glass-card flex items-center gap-3 rounded-full px-4 py-2">
              <Search className="h-4 w-4 shrink-0 text-[var(--gold)]" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن طبقك المفضل..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/45 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="مسح" className="text-[var(--gold)]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {query.trim() && (
              <div className="mt-3 pb-3">
                {searchResults.length === 0 ? (
                  <p className="text-center text-sm text-foreground/60">لا توجد نتائج مطابقة</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {searchResults.map((item) => {
                      const sOpts = optionsByItem[item.id] ?? [];
                      const sSel = selectedOption[item.id] ?? sOpts[0]?.id ?? "";
                      const sDiscount =
                        item.discount_price != null && item.discount_price < item.price;
                      const sPrice =
                        sOpts.length > 0
                          ? (sOpts.find((o) => o.id === sSel) ?? sOpts[0]).price
                          : sDiscount
                            ? item.discount_price!
                            : item.price;
                      return (
                        <article
                          key={`search-${item.id}`}
                          className="glass-card group flex flex-col overflow-hidden rounded-2xl"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden">
                            <img
                              src={item.image_url || ITEM_PLACEHOLDER}
                              alt={item.name}
                              loading="eager"
                              decoding="async"
                              onClick={() =>
                                setLightbox({
                                  src: item.image_url || ITEM_PLACEHOLDER,
                                  alt: item.name,
                                })
                              }
                              className="h-full w-full cursor-zoom-in object-cover"
                            />
                            <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
                              {(item as any).featured && (
                                <span className="inline-flex items-center rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold text-[var(--forest-deep)]">
                                  🔥 الأكثر طلباً
                                </span>
                              )}
                              {isNewItem(item) && (
                                <span className="inline-flex items-center rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold text-[var(--forest-deep)]">
                                  🆕 جديد
                                </span>
                              )}
                            </div>
                            {favButton(item)}
                          </div>
                          <div className="flex flex-1 flex-col gap-2 p-3">
                            <h3 className="font-display text-sm font-bold text-foreground">
                              {item.name}
                            </h3>
                            <div className="gold-text font-display text-sm font-bold">
                              {sPrice.toLocaleString()} <span className="text-[10px]">د.ع</span>
                            </div>
                            {ratingLine(item)}
                            <button
                              onClick={() => addToCart(item)}
                              className={`mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                                justAdded === item.id
                                  ? "bg-[#25D366] text-white"
                                  : "bg-[var(--gold)] text-[var(--forest-deep)]"
                              }`}
                            >
                              {justAdded === item.id ? "تمت الإضافة ✓" : "إضافة للطلب"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {navOpen && (
          <nav className="border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[var(--forest-deep)] px-4 py-4 animate-fade-in">
            <div className="flex flex-col gap-3 text-base">
              {SIDE_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setNavOpen(false)}
                  className="rounded-lg px-3 py-2 transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] hover:text-[var(--gold)]"
                >
                  {l.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setNavOpen(false);
                  setFavDrawerOpen(true);
                }}
                className="rounded-lg px-3 py-2 text-right transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] hover:text-[var(--gold)]"
              >
                ♡ المفضلة ({favoriteItems.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setNavOpen(false);
                  setReviewsOpen(true);
                }}
                className="rounded-lg px-3 py-2 text-right transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] hover:text-[var(--gold)]"
              >
                💬 آراء الزبائن
              </button>
              <a
                href="#contact"
                onClick={() => setNavOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] hover:text-[var(--gold)]"
              >
                📞 تواصل
              </a>



              <a
                href={`tel:${PHONE_PRIMARY}`}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 font-bold text-[var(--forest-deep)]"
              >
                <Phone className="h-4 w-4" />
                اتصل للطلب
              </a>
            </div>
          </nav>
        )}

      </header>

      {/* ============ HERO ============ */}
      {!storeOpen && (
        <div className="border-b border-red-500/40 bg-red-500/15 px-4 py-2.5 text-center text-xs font-bold text-red-200 md:text-sm">
          🚫 {closedMessage}
        </div>
      )}

      <section id="home" className="relative overflow-hidden">

        <div className="absolute inset-0">
          <img
            src={heroSrc}
            alt="مطعم جبل"
            width={1600}
            height={1100}
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--forest-deep)]/70 via-[var(--forest-deep)]/60 to-[var(--forest)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--gold)_15%,transparent),transparent_60%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 py-12 text-center md:min-h-[68vh] md:py-16">
          <img
            src={logoImg}
            alt="مطعم جبل - Jabal Restaurant"
            width={320}
            height={320}
            className="mx-auto h-40 w-auto object-contain drop-shadow-[0_8px_30px_rgba(255,189,89,0.35)] md:h-56"
          />

          <h1 className="mt-4 font-display text-[1.35rem] font-bold leading-tight text-foreground sm:text-2xl md:text-4xl lg:text-5xl animate-fade-in">
            {heroTitle.split(" ").length > 1 ? (
              <>
                {heroTitle.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="gold-text">{heroTitle.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="gold-text">{heroTitle}</span>
            )}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-loose text-foreground/85 md:text-lg animate-fade-in">
            {heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs animate-fade-in">
            <a
              href={`tel:${PHONE_PRIMARY}`}
              className="glass-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-foreground/90 hover:text-[var(--gold)]"
            >
              <Phone className="h-3 w-3 text-[var(--gold)]" />
              <span dir="ltr">{PHONE_PRIMARY}</span>
            </a>
            <a
              href={`tel:${PHONE_SECONDARY}`}
              className="glass-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-foreground/90 hover:text-[var(--gold)]"
            >
              <Phone className="h-3 w-3 text-[var(--gold)]" />
              <span dir="ltr">{PHONE_SECONDARY}</span>
            </a>
            <div className="glass-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-foreground/85">
              <MapPin className="h-3 w-3 text-[var(--gold)]" />
              <span>{ADDRESS_FULL}</span>
            </div>
          </div>
        </div>
      </section>


      {/* ============ OFFERS BANNER ============ */}
      {(menuLoading || offers.length > 0) && (
        <section className="px-4 pt-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-[var(--gold)]">عروضنا</span>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                <span className="gold-text">عروض</span> وخصومات
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menuLoading
                ? Array.from({ length: 3 }, (_, index) => <OfferSkeleton key={index} />)
                : offers.map((o) => (
                <div
                  key={o.id}
                  className="glass-card relative overflow-hidden rounded-3xl p-5 transition-transform hover:-translate-y-1"
                >
                  {o.badge && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-bold text-[var(--forest-deep)]">
                      <Sparkles className="h-3 w-3" />
                      {o.badge}
                    </span>
                  )}
                  <h3 className="mt-6 font-display text-lg font-bold text-foreground">{o.title}</h3>
                  {o.description && (
                    <p className="mt-2 text-sm leading-relaxed text-foreground/75">{o.description}</p>
                  )}
                </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ MOST ORDERED ============ */}
      {(menuLoading || (theme?.featured_enabled !== false && featuredItems.length > 0)) && (
        <section id="featured" className="scroll-mt-24 px-4 pt-14">

          <div className="mx-auto max-w-5xl">
            <button
              onClick={() => setFeatOpen((v) => !v)}
              className="glass-card flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-right md:px-6 md:py-4"
            >
              <span className="font-display text-lg font-bold md:text-2xl">
                <span className="gold-text">🔥 الأكثر طلباً</span>
              </span>
              <ChevronDown
                className={`h-5 w-5 text-[var(--gold)] transition-transform ${featOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div className={`${featOpen ? "mt-4 grid" : "hidden"} grid-cols-2 gap-3 md:gap-5`}>

              {menuLoading
                ? Array.from({ length: 4 }, (_, index) => <FeaturedCardSkeleton key={index} />)
                : featuredItems.map((item) => {
                const fOpts = optionsByItem[item.id] ?? [];
                const fSel = selectedOption[item.id] ?? fOpts[0]?.id ?? "";
                const fDiscount =
                  item.discount_price != null && item.discount_price < item.price;
                const fPrice =
                  fOpts.length > 0
                    ? (fOpts.find((o) => o.id === fSel) ?? fOpts[0]).price
                    : fDiscount
                      ? item.discount_price!
                      : item.price;
                return (
                  <article
                    key={`feat-${item.id}`}
                    className="glass-card group flex flex-col overflow-hidden rounded-2xl md:rounded-3xl"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <MenuImage
                        src={item.image_url}
                        alt={item.name}
                        onClick={() =>
                          setLightbox({ src: item.image_url || ITEM_PLACEHOLDER, alt: item.name })
                        }
                        className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold text-[var(--forest-deep)] shadow-[var(--shadow-gold)] md:text-xs">
                          🔥 الأكثر طلباً
                        </span>
                        {isNewItem(item) && (
                          <span className="inline-flex items-center rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold text-[var(--forest-deep)] shadow-[var(--shadow-gold)] md:text-xs">
                            🆕 جديد
                          </span>
                        )}
                      </div>
                      {favButton(item)}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
                      <h3 className="font-display text-sm font-bold text-foreground md:text-lg">
                        {item.name}
                      </h3>
                      <div className="gold-text font-display text-sm font-bold md:text-lg">
                        {fPrice.toLocaleString()} <span className="text-[10px] md:text-xs">د.ع</span>
                      </div>
                      {ratingLine(item)}
                      <input
                        type="text"
                        value={notes[item.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                        placeholder="ملاحظات (مثلاً: بدون مخلل)"
                        className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/50 px-2.5 py-1.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
                      />

                      <button
                        onClick={() => addToCart(item)}
                        className={`mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02] md:text-sm ${
                          justAdded === item.id
                            ? "bg-[#25D366] text-white"
                            : "bg-[var(--gold)] text-[var(--forest-deep)]"
                        }`}
                      >
                        {justAdded === item.id ? "تمت الإضافة ✓" : "إضافة للطلب"}

                      </button>
                    </div>
                  </article>
                  );
                })}
            </div>
          </div>
        </section>
      )}






      {/* ============ MENU ============ */}
      <section id="menu" className="relative px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[var(--gold)]">قائمتنا الفاخرة</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
              <span className="gold-text">أقسام</span> المنيو
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-loose text-foreground/80 md:text-base">
              من قلب أبي الخصيب، نجمع بين النكهات الغربية الفاخرة واللمسات الشرقية الدافئة، لنخلق قائمة طعام متكاملة تناسب جميع الأذواق.
            </p>
          </div>

          {/* Collapsible categories */}
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 md:gap-4">
            {menuLoading
              ? Array.from({ length: 6 }, (_, index) => <CategorySkeleton key={index} />)
              : categories.filter((c) => c.visible !== false).map((c) => {
              const catItems = itemsByCat[c.id] ?? [];
              const catCount = catCounts[c.id] ?? catItems.length;
              if (catCount === 0) return null;

              const isOpen = openCat === c.id;
              return (
                <div
                  key={c.id}
                  id={`cat-${c.id}`}
                  className={`glass-card overflow-hidden rounded-2xl scroll-mt-24 md:rounded-3xl ${isOpen ? "col-span-2" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    aria-expanded={isOpen}
                    className="flex w-full flex-col items-center justify-center gap-3 px-4 py-5 text-center transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_8%,transparent)] md:px-6 md:py-7"
                  >
                    {c.image_url ? (
                      <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-[color-mix(in_oklab,var(--gold)_65%,transparent)] md:h-20 md:w-20">
                        <MenuImage
                          src={c.image_url}
                          alt={c.name}
                          className="block h-full w-full object-cover object-center"
                        />
                      </span>
                    ) : (
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full ring-2 ring-[color-mix(in_oklab,var(--gold)_65%,transparent)] text-[var(--gold)] md:h-20 md:w-20">
                        <UtensilsCrossed className="h-7 w-7 md:h-8 md:w-8" />
                      </span>
                    )}
                    <div className="text-center">
                      {c.tag && (
                        <span className="block text-[10px] uppercase tracking-widest text-[var(--gold)]/80">
                          {c.tag}
                        </span>
                      )}
                      <span className="font-display text-base font-bold md:text-xl lg:text-2xl">
                        <span className="gold-text">{c.name}</span>
                      </span>
                      <span className="mt-1 block text-[10px] text-foreground/60 md:text-xs">
                        {catCount} طبق
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[color-mix(in_oklab,var(--gold)_15%,transparent)] px-4 py-5 md:px-6 md:py-7">
                      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
                        {openingCategory === c.id || loadingCat === c.id || catItems.length === 0
                          ? Array.from({ length: Math.min(3, Math.max(1, catCount)) }, (_, index) => (
                              <DishCardSkeleton key={index} />
                            ))
                          : catItems.map((item) => {

                          const key = item.id;
                          const qty = getPending(key);
                          const itemOpts = optionsByItem[item.id] ?? [];
                          const selId =
                            selectedOption[item.id] ??
                            (itemOpts[0]?.id ?? "");
                          const hasDiscount =
                            item.discount_price != null && item.discount_price < item.price;
                          const displayPrice =
                            itemOpts.length > 0
                              ? (itemOpts.find((o) => o.id === selId) ?? itemOpts[0]).price
                              : hasDiscount
                                ? item.discount_price!
                                : item.price;
                          const inCartCount = Object.values(cart)
                            .filter((l) => l.itemId === item.id)
                            .reduce((a, b) => a + b.qty, 0);
                          return (
                            <article
                              key={key}
                              className="glass-card group flex flex-col gap-3 overflow-hidden rounded-2xl transition-all hover:border-[color-mix(in_oklab,var(--gold)_50%,transparent)]"
                            >
                              <div className="relative aspect-[16/10] w-full overflow-hidden">
                                <MenuImage
                                  src={item.image_url}
                                  alt={item.name}
                                  onClick={() =>
                                    setLightbox({
                                      src: item.image_url || ITEM_PLACEHOLDER,
                                      alt: item.name,
                                    })
                                  }
                                  className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {hasDiscount && itemOpts.length === 0 && (
                                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                    <Sparkles className="h-3 w-3" /> عرض
                                  </span>
                                )}
                                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                                  {(item as any).featured && (
                                    <span className="inline-flex items-center rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold text-[var(--forest-deep)] shadow-[var(--shadow-gold)] md:text-xs">
                                      🔥 الأكثر طلباً
                                    </span>
                                  )}
                                  {isNewItem(item) && (
                                    <span className="inline-flex items-center rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold text-[var(--forest-deep)] shadow-[var(--shadow-gold)] md:text-xs">
                                      🆕 جديد
                                    </span>
                                  )}
                                 </div>
                                 {favButton(item)}
                               </div>

                               <div className="flex flex-col gap-3 p-4 md:p-5">

                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-display text-lg font-bold text-foreground md:text-xl">
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="mt-1 flex items-baseline gap-2">
                                      <span className="gold-text font-display text-lg font-bold md:text-xl">
                                        {displayPrice.toLocaleString()}
                                      </span>
                                      <span className="text-xs uppercase tracking-widest text-[var(--gold)]/70">
                                        د.ع
                                      </span>
                                      {hasDiscount && itemOpts.length === 0 && (
                                        <span className="text-xs text-foreground/50 line-through">
                                          {item.price.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="shrink-0">{ratingLine(item)}</div>
                                </div>


                                {itemOpts.length > 0 && (
                                  <div className="flex flex-row flex-wrap gap-2">
                                    {itemOpts.map((o) => {
                                      const active = selId === o.id;
                                      return (
                                        <button
                                          key={o.id}
                                          type="button"
                                          onClick={() =>
                                            setSelectedOption((s) => ({ ...s, [item.id]: o.id }))
                                          }
                                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                                            active
                                              ? "bg-[var(--gold)] text-[var(--forest-deep)]"
                                              : "gold-border text-foreground/80 hover:text-[var(--gold)]"
                                          }`}
                                        >
                                          {o.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}



                                <input
                                  type="text"

                                  value={notes[key] ?? ""}
                                  onChange={(e) =>
                                    setNotes((n) => ({ ...n, [key]: e.target.value }))
                                  }
                                  placeholder="ملاحظات (مثلاً: بدون مخلل)"
                                  className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
                                />

                                <div className="flex flex-col items-stretch gap-3 pt-1">
                                  <div className="flex items-center justify-center gap-3 rounded-full gold-border p-1.5">
                                    <button
                                      onClick={() => setPending(key, -1)}
                                      className="grid h-8 w-8 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                                      aria-label="إنقاص"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center text-base font-bold tabular-nums">{qty}</span>
                                    <button
                                      onClick={() => setPending(key, +1)}
                                      className="grid h-8 w-8 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                                      aria-label="زيادة"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] ${
                                      justAdded === key
                                        ? "bg-[#25D366] text-white"
                                        : "bg-[var(--gold)] text-[var(--forest-deep)]"
                                    }`}
                                  >
                                    {justAdded === key
                                      ? "تمت الإضافة ✓"
                                      : inCartCount > 0
                                        ? `إضافة للطلب (${inCartCount})`
                                        : "إضافة للطلب"}

                                  </button>
                                </div>
                              </div>
                            </article>
                            );
                          })}
                      </div>
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => closeCat(c.id)}
                          className="inline-flex items-center gap-2 rounded-full gold-border bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] px-6 py-2.5 text-sm font-bold text-[var(--gold)] transition-all hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                        >
                          <X className="h-4 w-4" />
                          إغلاق القسم
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
                })}

          </div>
        </div>
      </section>


      {/* ============ ABOUT ============ */}
      <section id="about" className="relative px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs uppercase tracking-widest text-[var(--gold)]">عن المطعم</span>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
            قصتنا تبدأ <span className="gold-text">بشغف</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-loose text-foreground/85 md:text-lg">
            مطعم جبل ليس مجرد مطعم – إنه وجهة لمحبي الطعام الراقي في البصرة.
            نختار مكوناتنا بعناية، ونحضّر أطباقنا بحب، لنقدّم لك تجربة لا تُنسى مع كل لقمة.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { value: `+${categories.length}`, label: "قسم" },
              { value: `+${items.length}`, label: "طبق مميّز" },
              { value: "5.0", label: "تقييم" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card flex flex-col items-center gap-1 rounded-2xl p-3 text-center sm:p-4"
              >
                <div className="gold-text font-display text-xl font-bold sm:text-2xl">{s.value}</div>
                <div className="text-xs text-foreground/75 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="relative px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[var(--gold)]">تواصل معنا</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
              <span className="gold-text">زورونا</span> أو اطلبوا
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                title: "العنوان",
                lines: ["أبي الخصيب - فلكة التجنيد"],
                href: theme?.location_url || "https://maps.google.com/?q=Abi+Al-Khasib+Basra",
              },
              {
                icon: Phone,
                title: "للطلب والاستفسار",
                lines: [PHONE_PRIMARY, PHONE_SECONDARY],
                href: `tel:${PHONE_PRIMARY}`,
              },
              {
                icon: Instagram,
                title: "إنستغرام",
                lines: ["@japppel"],
                href: "https://instagram.com/japppel",
              },
              {
                icon: MessageCircle,
                title: "تيك توك",
                lines: ["@jeepl25"],
                href: TIKTOK_URL,
              },
            ].map((c) => (
              <a
                key={c.title}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card group flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-transform hover:-translate-y-1 sm:p-4"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] transition-colors group-hover:bg-[var(--gold)] group-hover:text-[var(--forest-deep)] sm:h-10 sm:w-10">
                  <c.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="font-display text-xs font-bold sm:text-sm">{c.title}</div>
                <div className="space-y-0.5 text-[11px] text-foreground/75 sm:text-xs">
                  {c.lines.map((l) => (
                    <div key={l} dir="ltr">{l}</div>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] px-4 py-10 text-center">
        <div className="mx-auto max-w-3xl">
          <img src={logoImg} alt="مطعم جبل" width={56} height={56} className="mx-auto h-14 w-14 rounded-full" />
          <p className="mt-5 text-sm leading-loose text-foreground/75">
            هنا تجد الطعم كما لم تذقه من قبل <span className="text-red-400">❤️</span>
          </p>
          <p className="mt-4 text-[10px] text-foreground/50">
            {theme?.footer_text ?? "مطعم جبل 2026 — جميع الحقوق محفوظة"}
          </p>

          <a href="/admin" aria-label="admin" className="mt-3 inline-block h-2 w-2 rounded-full bg-foreground/10 hover:bg-[var(--gold)]" />
        </div>
      </footer>

      {/* ============ FLOATING ACTIONS ============ */}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="واتساب"
        className="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_-10px_rgba(37,211,102,0.7)] transition-transform hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

      <button
        onClick={() => setCartOpen(true)}
        aria-label="السلة"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--gold)] text-[var(--forest-deep)] shadow-gold transition-transform hover:scale-110"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
            {cartCount}
          </span>
        )}
      </button>

      {/* ============ CART DRAWER ============ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setCartOpen(false);
              setShowCheckoutWarning(false);
            }}
          />
          <aside className="relative ms-auto flex h-full w-full max-w-md flex-col bg-[var(--forest-deep)] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[color-mix(in_oklab,var(--gold)_18%,transparent)] px-5 py-4">
              <h3 className="font-display text-lg font-bold">
                <span className="gold-text">سلة الطلب</span>
                {cartCount > 0 && (
                  <span className="ms-2 text-sm text-foreground/60">({cartCount} عنصر)</span>
                )}
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full gold-border p-2 text-[var(--gold)]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartEntries.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-foreground/60">
                  <ShoppingCart className="h-12 w-12 text-[var(--gold)]/50" />
                  <p>السلة فارغة. أضف أطباقك المفضلة!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cartEntries.map((e) => (
                    <div
                      key={e.key}
                      className="glass-card flex flex-col gap-1.5 rounded-xl p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-snug">
                            {e.item.name}

                            {e.line.optionName && (
                              <span className="ms-1.5 text-[10px] text-[var(--gold)]">
                                ({e.line.optionName})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-foreground/60">
                            {e.line.unitPrice.toLocaleString()} د.ع × {e.line.qty}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 rounded-full gold-border p-0.5">
                          <button
                            onClick={() => setCartQty(e.key, -1)}
                            className="grid h-6 w-6 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                            aria-label="إنقاص"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold tabular-nums">{e.line.qty}</span>
                          <button
                            onClick={() => setCartQty(e.key, +1)}
                            className="grid h-6 w-6 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                            aria-label="زيادة"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(e.key)}
                          className="grid h-7 w-7 place-items-center rounded-full text-red-400 hover:bg-red-500/10"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={e.line.note}
                        onChange={(ev) => setCartNote(e.key, ev.target.value)}
                        placeholder="✏️ ملاحظة (مثلاً: بدون مخلل)"
                        className="w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/60 px-2 py-1.5 text-[11px] text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
                      />

                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartEntries.length > 0 && (
              <div className="border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[var(--forest)] px-5 py-4">
                <div className="mb-2.5 space-y-1.5">
                  {areas.length > 0 && (
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      className="w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-xs focus:border-[var(--gold)] focus:outline-none"
                    >
                      <option value="">اختر منطقة التوصيل * ▾</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    placeholder="العنوان الكامل للتوصيل"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-xs focus:border-[var(--gold)] focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-xs focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                {!storeOpen && (
                  <div className="mb-2.5 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300">
                    🚫 {closedMessage}
                  </div>
                )}
                {storeOpen && !canCheckout && (
                  <div className="mb-2.5 rounded-lg border border-[color-mix(in_oklab,var(--gold)_35%,transparent)] bg-[var(--gold)]/10 px-3 py-2 text-[11px] text-[var(--gold)]">
                    ⚠️ يرجى اختيار منطقة التوصيل وإدخال رقم الهاتف لتفعيل الإرسال.
                  </div>
                )}
                {orderError && (
                  <div className="mb-2.5 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                    {orderError}
                  </div>
                )}

                <div className="mb-2.5 space-y-1">

                  {selectedArea && (
                    <div className="flex items-center justify-between text-[11px] text-foreground/70">
                      <span>التوصيل ({selectedArea.name})</span>
                      <span>{deliveryFee.toLocaleString()} د.ع</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs text-foreground/80">المجموع الكلي</span>
                    <span className="gold-text font-display text-lg font-bold">
                      {grandTotal.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>

                <button
                  onClick={sendCartToWhatsapp}
                  disabled={!canCheckout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  إرسال الطلب
                </button>

              </div>
            )}
          </aside>
        </div>
      )}

      {/* ============ IMAGE LIGHTBOX ============ */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ touchAction: "pinch-zoom" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-auto overscroll-contain bg-black/90 p-4 animate-fade-in"
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
            className="fixed top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full gold-border bg-[var(--forest-deep)]/80 text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "pinch-zoom" }}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-[var(--shadow-card)]"
          />
        </div>

      )}

      {/* ============ RATING MODAL ============ */}
      {rateTarget && (
        <div
          onClick={() => setRateTarget(null)}
          className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-sm rounded-2xl p-5 text-center"
          >
            <div className="mb-1 font-display text-lg font-bold gold-text">
              {rateTarget.type === "dish" ? "✍️ قَيّم الطبق" : "⭐️ تقييم المطعم"}
            </div>
            <div className="mb-4 text-sm text-foreground/70">{rateTarget.name}</div>
            <div className="mb-5 flex justify-center">
              <Stars value={rateStars} size="lg" onPick={setRateStars} />
            </div>
            <div className="flex gap-2">
              <button
                disabled={rateStars < 1}
                onClick={async () => {
                  try {
                    if (rateTarget.type === "dish" && rateTarget.id) {
                      await submitDishRating(rateTarget.id, rateStars);
                      fetchDishRatings().then(setRatings).catch(console.error);
                    } else {
                      await submitRestaurantRating(rateStars, "");
                    }
                  } catch (err) {
                    console.error(err);
                  }
                  setRateTarget(null);
                  setRateStars(0);
                }}
                className="flex-1 rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-[var(--forest-deep)] disabled:opacity-50"
              >
                إرسال التقييم
              </button>
              <button
                onClick={() => setRateTarget(null)}
                className="rounded-full gold-border px-4 py-2.5 text-sm text-foreground/80"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FAVORITES DRAWER (side menu) ============ */}
      {favDrawerOpen && (
        <div className="fixed inset-0 z-[95] flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFavDrawerOpen(false)}
          />
          <aside className="relative ms-auto flex h-full w-full max-w-md flex-col bg-[var(--forest-deep)] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[color-mix(in_oklab,var(--gold)_18%,transparent)] px-5 py-4">
              <h3 className="font-display text-lg font-bold">
                <span className="gold-text">♡ المفضلة</span>
                <span className="ms-2 text-sm text-foreground/60">({favoriteItems.length})</span>
              </h3>
              <button
                onClick={() => setFavDrawerOpen(false)}
                className="rounded-full gold-border p-2 text-[var(--gold)]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {favoriteItems.length === 0 ? (
                <p className="mt-10 text-center text-sm text-foreground/60">
                  لم تقم بإضافة أطباق إلى المفضلة بعد — اضغط ♡ على أي طبق.
                </p>
              ) : (
                <div className="space-y-3">
                  {favoriteItems.map((item) => {
                    const { price } = priceForSelection(item);
                    return (
                      <div key={`favd-${item.id}`} className="glass-card flex items-center gap-3 rounded-xl p-2">
                        <img
                          src={item.image_url || ITEM_PLACEHOLDER}
                          alt={item.name}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{item.name}</div>
                          <div className="gold-text text-xs font-bold">
                            {price.toLocaleString()} د.ع
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="shrink-0 rounded-full bg-[var(--gold)] px-3 py-1.5 text-[11px] font-bold text-[var(--forest-deep)]"
                        >
                          {justAdded === item.id ? "تمت الإضافة ✓" : "إضافة للطلب"}
                        </button>
                        <button
                          onClick={() => toggleFav(item.id)}
                          aria-label="إزالة"
                          className="shrink-0 text-red-400"
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ============ CUSTOMER REVIEWS ============ */}
      {reviewsOpen && (
        <div
          onClick={() => setReviewsOpen(false)}
          className="fixed inset-0 z-[105] grid place-items-center overflow-y-auto bg-black/80 p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card my-8 w-full max-w-lg rounded-2xl p-5"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h3 className="gold-text font-display text-xl font-bold">رأيك يهمنا</h3>
                <p className="mt-1 text-xs text-foreground/70">
                  اكتب رأيك أو تجربتك مع المطعم وأي ملاحظة
                </p>
              </div>
              <button
                onClick={() => setReviewsOpen(false)}
                aria-label="إغلاق"
                className="rounded-full gold-border p-2 text-[var(--gold)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex justify-center">
              <Stars value={reviewStars} size="lg" onPick={setReviewStars} />
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="اكتب رأيك هنا..."
              className="mt-3 w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/60 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
            />
            {reviewMsg && (
              <div className="mt-2 text-center text-xs text-[var(--gold)]">{reviewMsg}</div>
            )}
            <button
              disabled={reviewStars < 1}
              onClick={async () => {
                setReviewMsg(null);
                const limited = rateLimit("review", 30_000, 5);
                if (limited) return setReviewMsg(limited);
                try {
                  await submitRestaurantRating(reviewStars, sanitizeText(reviewText, 500));
                  setReviewStars(0);
                  setReviewText("");
                  setReviewMsg("شكراً لك! تم إرسال رأيك ❤️");
                  fetchRestaurantRatings().then(setReviews).catch(console.error);
                } catch (err: any) {
                  setReviewMsg("تعذر الإرسال، حاول لاحقاً.");
                  console.error(err);
                }
              }}
              className="mt-3 w-full rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-[var(--forest-deep)] disabled:opacity-50"
            >
              إرسال رأيي
            </button>

            <div className="mt-5 border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] pt-4">
              <div className="mb-3 font-display text-sm font-bold text-[var(--gold)]">
                آراء الزبائن ({reviews.length})
              </div>
              {reviews.length === 0 ? (
                <p className="text-center text-xs text-foreground/60">لا توجد آراء بعد.</p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Stars value={r.stars} />
                        {r.pinned && (
                          <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold text-[var(--forest-deep)]">
                            ★ مميّز
                          </span>
                        )}
                      </div>
                      {r.comment && (
                        <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>


  );
}
