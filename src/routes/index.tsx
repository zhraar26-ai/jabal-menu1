import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import {
  Category,
  MenuItem,
  MenuItemOption,
  Offer,
  ThemeSettings,
  applyTheme,
  fetchCategories,
  fetchMenuItems,
  fetchMenuItemOptions,
  fetchOffers,
  fetchTheme,
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
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const reloadAll = () => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchMenuItems().then(setItems).catch(console.error);
    fetchMenuItemOptions().then(setOptions).catch(console.error);
    fetchOffers(true).then(setOffers).catch(console.error);
    fetchTheme()
      .then((t) => {
        if (t) {
          setTheme(t);
          applyTheme(t);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    reloadAll();
    const sb = supabase as any;
    const channel = sb
      .channel("menu-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        fetchCategories().then(setCategories).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () =>
        fetchMenuItems().then(setItems).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_item_options" }, () =>
        fetchMenuItemOptions().then(setOptions).catch(console.error),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () =>
        fetchOffers(true).then(setOffers).catch(console.error),
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

  useEffect(() => {
    if (activeCat) return;
    const first = categories
      .filter((c) => c.visible !== false)
      .find((c) => (itemsByCat[c.id] ?? []).length > 0);
    if (first) setActiveCat(first.id);
  }, [categories, itemsByCat, activeCat]);

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

  const addToCart = (item: MenuItem) => {
    const qty = getPending(item.id);
    const note = (notes[item.id] ?? "").trim();
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

  const sendCartToWhatsapp = () => {
    if (!customerPhone.trim() || !customerAddress.trim()) {
      setShowCheckoutWarning(true);
      return;
    }
    const lines = cartEntries.map((e) => {
      const label = e.line.optionName ? `${e.item.name} (${e.line.optionName})` : e.item.name;
      const noteLine = e.line.note ? `\n   ملاحظة: ${e.line.note}` : "";
      return `• ${label} × ${e.line.qty} = ${(e.line.unitPrice * e.line.qty).toLocaleString()} د.ع${noteLine}`;
    });
    const text =
      `مرحبا، طلب جديد من منيو جبل الإلكتروني:\n\n${lines.join("\n")}\n\n` +
      `المجموع: ${cartTotal.toLocaleString()} د.ع\n\n` +
      `رقم الهاتف: ${customerPhone}\nالعنوان: ${customerAddress}`;
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

          <div className="hidden flex-1 items-center justify-end md:flex">
            <a
              href={`tel:${PHONE_PRIMARY}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3.5 py-1.5 text-xs font-bold text-[var(--forest-deep)] shadow-gold transition-transform hover:scale-105"
            >
              <Phone className="h-3.5 w-3.5" />
              اتصل للطلب
            </a>
          </div>

          <button
            onClick={() => setNavOpen((v) => !v)}
            className="rounded-full gold-border p-2 text-[var(--gold)] md:hidden"
            aria-label="القائمة"
          >
            {navOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {navOpen && (
          <nav className="border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[var(--forest-deep)] px-4 py-4 md:hidden animate-fade-in">
            <div className="flex flex-col gap-3 text-base">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setNavOpen(false)}
                  className="rounded-lg px-3 py-2 transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] hover:text-[var(--gold)]"
                >
                  {l.label}
                </a>
              ))}
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

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in">
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
      {offers.length > 0 && (
        <section className="px-4 pt-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-[var(--gold)]">عروضنا</span>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                <span className="gold-text">عروض</span> وخصومات
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((o) => (
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

          {/* Horizontal category tabs */}
          <div className="mx-auto mt-10 max-w-5xl">
            {/* Tabs bar */}
            <div
              className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
              dir="rtl"
            >
              {categories
                .filter((c) => c.visible !== false)
                .map((c) => {
                  const catItems = itemsByCat[c.id] ?? [];
                  if (catItems.length === 0) return null;
                  const active = activeCat === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCat(c.id)}
                      className={`group relative flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-right transition-all md:px-5 md:py-3 ${
                        active
                          ? "bg-[var(--gold)] text-[var(--forest-deep)] shadow-gold"
                          : "glass-card text-foreground hover:text-[var(--gold)]"
                      }`}
                    >
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className={`h-9 w-9 rounded-full object-cover md:h-10 md:w-10 ${
                            active ? "border border-[var(--forest-deep)]/30" : "gold-border"
                          }`}
                        />
                      ) : (
                        <span
                          className={`grid h-9 w-9 place-items-center rounded-full md:h-10 md:w-10 ${
                            active
                              ? "bg-[var(--forest-deep)]/20 text-[var(--forest-deep)]"
                              : "gold-border text-[var(--gold)]"
                          }`}
                        >
                          <UtensilsCrossed className="h-4 w-4" />
                        </span>
                      )}
                      <div className="flex flex-col items-start">
                        {c.tag && (
                          <span
                            className={`text-[10px] uppercase tracking-widest ${
                              active ? "text-[var(--forest-deep)]/70" : "text-[var(--gold)]/80"
                            }`}
                          >
                            {c.tag}
                          </span>
                        )}
                        <span className="whitespace-nowrap font-display text-sm font-bold md:text-base">
                          {c.name}
                        </span>
                      </div>
                      <span
                        className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-block ${
                          active
                            ? "bg-[var(--forest-deep)]/15 text-[var(--forest-deep)]"
                            : "bg-[color-mix(in_oklab,var(--gold)_15%,transparent)] text-[var(--gold)]"
                        }`}
                      >
                        {catItems.length}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Active category items */}
            {(() => {
              const c = categories.find((c) => c.id === activeCat);
              const catItems = c ? itemsByCat[c.id] ?? [] : [];
              if (!c || catItems.length === 0) {
                return (
                  <div className="mt-8 text-center text-foreground/60">
                    اختر قسماً لعرض أكلاته
                  </div>
                );
              }
              return (
                <div className="mt-6">
                  <div className="mb-4 flex items-center gap-3">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="h-12 w-12 rounded-full object-cover gold-border"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full gold-border text-[var(--gold)]">
                        <UtensilsCrossed className="h-5 w-5" />
                      </span>
                    )}
                    <div>
                      {c.tag && (
                        <span className="text-[10px] uppercase tracking-widest text-[var(--gold)]/80">
                          {c.tag}
                        </span>
                      )}
                      <h3 className="font-display text-xl font-bold md:text-2xl">
                        <span className="gold-text">{c.name}</span>
                      </h3>
                    </div>
                    <span className="me-auto rounded-full bg-[color-mix(in_oklab,var(--gold)_15%,transparent)] px-3 py-1 text-xs text-[var(--gold)]">
                      {catItems.length} طبق
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {catItems.map((item) => {
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
                          className="glass-card group flex flex-col gap-2 overflow-hidden rounded-2xl transition-all hover:border-[color-mix(in_oklab,var(--gold)_50%,transparent)]"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden">
                            <img
                              src={item.image_url || ITEM_PLACEHOLDER}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {hasDiscount && itemOpts.length === 0 && (
                              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                <Sparkles className="h-2.5 w-2.5" /> عرض
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-display text-base font-bold text-foreground md:text-lg">
                                  {item.name}
                                </h4>
                                {item.description && (
                                  <p className="mt-0.5 text-xs leading-snug text-foreground/65">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0 text-end">
                                <div className="gold-text font-display text-base font-bold md:text-lg">
                                  {displayPrice.toLocaleString()}
                                </div>
                                {hasDiscount && itemOpts.length === 0 && (
                                  <div className="text-[10px] text-foreground/50 line-through">
                                    {item.price.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-[10px] uppercase tracking-widest text-[var(--gold)]/70">
                                  د.ع
                                </div>
                              </div>
                            </div>

                            {itemOpts.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {itemOpts.map((o) => {
                                  const active = selId === o.id;
                                  return (
                                    <button
                                      key={o.id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedOption((s) => ({ ...s, [item.id]: o.id }))
                                      }
                                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                        active
                                          ? "bg-[var(--gold)] text-[var(--forest-deep)]"
                                          : "gold-border text-foreground/80 hover:text-[var(--gold)]"
                                      }`}
                                    >
                                      {o.name}
                                      <span className="ms-1 opacity-70">
                                        · {o.price.toLocaleString()}
                                      </span>
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
                              className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/50 px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
                            />

                            <div className="flex flex-col items-stretch gap-2 pt-1">
                              <div className="flex items-center justify-center gap-2 rounded-full gold-border p-1">
                                <button
                                  onClick={() => setPending(key, -1)}
                                  className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                                  aria-label="إنقاص"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                                <button
                                  onClick={() => setPending(key, +1)}
                                  className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                                  aria-label="زيادة"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                onClick={() => addToCart(item)}
                                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02] ${
                                  justAdded === key
                                    ? "bg-[#25D366] text-white"
                                    : "bg-[var(--gold)] text-[var(--forest-deep)]"
                                }`}
                              >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                {justAdded === key
                                  ? "تمت الإضافة ✓"
                                  : inCartCount > 0
                                    ? `إضافة إلى السلة (${inCartCount})`
                                    : "إضافة إلى السلة"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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
                <div className="space-y-3">
                  {cartEntries.map((e) => (
                    <div
                      key={e.key}
                      className="glass-card flex flex-col gap-2 rounded-2xl p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold">
                            {e.item.name}
                            {e.line.optionName && (
                              <span className="ms-2 text-xs text-[var(--gold)]">
                                ({e.line.optionName})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-foreground/60">
                            {e.line.unitPrice.toLocaleString()} د.ع × {e.line.qty}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full gold-border p-1">
                          <button
                            onClick={() => setCartQty(e.key, -1)}
                            className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                            aria-label="إنقاص"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums">{e.line.qty}</span>
                          <button
                            onClick={() => setCartQty(e.key, +1)}
                            className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                            aria-label="زيادة"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(e.key)}
                          className="grid h-8 w-8 place-items-center rounded-full text-red-400 hover:bg-red-500/10"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={e.line.note}
                        onChange={(ev) => setCartNote(e.key, ev.target.value)}
                        placeholder="✏️ أضف أو عدّل ملاحظة (مثلاً: بدون مخلل)"
                        className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/60 px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartEntries.length > 0 && (
              <div className="border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[var(--forest)] px-5 py-4">
                <div className="mb-3 space-y-2">
                  <input
                    type="tel"
                    placeholder="رقم الهاتف *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-4 py-2.5 text-sm focus:border-[var(--gold)] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="العنوان الكامل للتوصيل *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-4 py-2.5 text-sm focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                {showCheckoutWarning && (!customerPhone.trim() || !customerAddress.trim()) && (
                  <div className="mb-3 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    ⚠️ يرجى إضافة رقم الهاتف والعنوان قبل إرسال الطلب.
                  </div>
                )}

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-foreground/70">المجموع</span>
                  <span className="gold-text font-display text-xl font-bold">
                    {cartTotal.toLocaleString()} د.ع
                  </span>
                </div>
                <button
                  onClick={sendCartToWhatsapp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="h-4 w-4" />
                  إرسال الطلب عبر واتساب
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
