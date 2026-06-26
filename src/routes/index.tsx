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
  Star,
  UtensilsCrossed,
  ChefHat,
  Trash2,
  Sparkles,
} from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import logoImg from "@/assets/logo.png";
import {
  Category,
  MenuItem,
  Offer,
  ThemeSettings,
  applyTheme,
  fetchCategories,
  fetchMenuItems,
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
  { href: "#menu", label: "قائمتنا الفاخرة" },
  { href: "#about", label: "عن المطعم" },
  { href: "#contact", label: "تواصل" },
];

type CartLine = { qty: number; note: string };

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);

  const [pendingQty, setPendingQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<Record<string, CartLine>>({});

  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showCheckoutWarning, setShowCheckoutWarning] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchMenuItems().then(setItems).catch(console.error);
    fetchOffers(true).then(setOffers).catch(console.error);
    fetchTheme()
      .then((t) => {
        if (t) {
          setTheme(t);
          applyTheme(t);
        }
      })
      .catch(console.error);
  }, []);

  const itemsByCat = useMemo(() => {
    const m: Record<string, MenuItem[]> = {};
    for (const c of categories) m[c.id] = [];
    for (const it of items) {
      if (!it.available) continue;
      (m[it.category_id] ||= []).push(it);
    }
    return m;
  }, [categories, items]);

  const itemById = useMemo(() => {
    const m: Record<string, MenuItem> = {};
    for (const it of items) m[it.id] = it;
    return m;
  }, [items]);

  const effectivePrice = (it: MenuItem) =>
    it.discount_price != null && it.discount_price < it.price ? it.discount_price : it.price;

  const getPending = (key: string) => pendingQty[key] ?? 1;
  const setPending = (key: string, delta: number) =>
    setPendingQty((q) => ({ ...q, [key]: Math.max(1, (q[key] ?? 1) + delta) }));

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

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b.qty, 0),
    [cart],
  );

  const cartEntries = useMemo(() => {
    const entries: { key: string; item: MenuItem; qty: number; note: string }[] = [];
    for (const [key, line] of Object.entries(cart)) {
      const it = itemById[key];
      if (it && line.qty > 0) entries.push({ key, item: it, qty: line.qty, note: line.note });
    }
    return entries;
  }, [cart, itemById]);

  const cartTotal = useMemo(
    () => cartEntries.reduce((s, e) => s + effectivePrice(e.item) * e.qty, 0),
    [cartEntries],
  );

  const addToCart = (itemId: string) => {
    const qty = getPending(itemId);
    const note = (notes[itemId] ?? "").trim();
    setCart((c) => {
      const existing = c[itemId];
      return {
        ...c,
        [itemId]: {
          qty: (existing?.qty ?? 0) + qty,
          note: note || existing?.note || "",
        },
      };
    });
    setPendingQty((q) => ({ ...q, [itemId]: 1 }));
    setJustAdded(itemId);
    setTimeout(() => setJustAdded((j) => (j === itemId ? null : j)), 1200);
  };

  const sendCartToWhatsapp = () => {
    if (!customerPhone.trim() || !customerAddress.trim()) {
      setShowCheckoutWarning(true);
      return;
    }
    const lines = cartEntries.map(
      (e) =>
        `• ${e.item.name} × ${e.qty} = ${(effectivePrice(e.item) * e.qty).toLocaleString()} د.ع${
          e.note ? `\n   ملاحظة: ${e.note}` : ""
        }`,
    );
    const text =
      `مرحبا، طلب جديد من منيو جبل الإلكتروني:\n\n${lines.join("\n")}\n\n` +
      `المجموع: ${cartTotal.toLocaleString()} د.ع\n\n` +
      `رقم الهاتف: ${customerPhone}\nالعنوان: ${customerAddress}`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const quickWhatsapp = () => {
    const text = "مرحباً، أرغب بالاستفسار عن مطعم جبل";
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
          <nav className="hidden flex-1 items-center gap-7 text-sm md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="story-link text-foreground/85 transition-colors hover:text-[var(--gold)]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a href="#home" className="flex shrink-0 items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
            <img src={logoImg} alt="مطعم جبل" width={44} height={44} className="h-11 w-11 rounded-full" />
            <span className="gold-text font-display text-lg font-bold md:text-xl">مطعم جبل</span>
          </a>

          <div className="hidden flex-1 items-center justify-start md:flex">
            <a
              href={`tel:${PHONE_PRIMARY}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-[var(--forest-deep)] shadow-gold transition-transform hover:scale-105"
            >
              <Phone className="h-4 w-4" />
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

        <div className="relative mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center md:min-h-[68vh] md:py-20">
          <h1 className="mt-7 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl animate-fade-in">
            {heroTitle.split(" ").length > 1 ? (
              <>
                {heroTitle.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="gold-text">{heroTitle.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="gold-text">{heroTitle}</span>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-loose text-foreground/85 md:text-lg animate-fade-in">
            {heroSubtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-7 py-3.5 text-sm font-bold text-[var(--forest-deep)] shadow-gold transition-transform hover:scale-105"
            >
              <UtensilsCrossed className="h-4 w-4" />
              تصفح المنيو
            </a>
            <button
              onClick={quickWhatsapp}
              className="inline-flex items-center gap-2 rounded-full gold-border bg-transparent px-7 py-3.5 text-sm font-bold text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
            >
              <Phone className="h-4 w-4" />
              للطلب والاستفسار
            </button>
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
              <span className="gold-text">أقسام</span> المطعم
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/75">
              تشكيلة واسعة من أشهى الأطباق العالمية والشرقية، اختر ما يناسب ذوقك.
            </p>
          </div>

          {/* Category chips */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="group inline-flex flex-col items-center gap-1 rounded-2xl gold-border bg-[var(--forest-deep)] px-5 py-3 text-center shadow-card transition-transform hover:-translate-y-1 hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
              >
                {c.tag && (
                  <span className="text-[10px] uppercase tracking-widest text-[var(--gold)] group-hover:text-[var(--forest-deep)]">
                    {c.tag}
                  </span>
                )}
                <span className="font-display text-base font-bold md:text-lg">{c.name}</span>
              </a>
            ))}
          </div>

          {/* Items per category */}
          <div className="mt-20 space-y-20">
            {categories.map((c) => {
              const catItems = itemsByCat[c.id] ?? [];
              if (catItems.length === 0) return null;
              return (
                <div key={c.id} id={`cat-${c.id}`} className="scroll-mt-24">
                  <div className="mb-10 flex flex-col items-center gap-4 text-center">
                    <h3 className="font-display text-2xl font-bold md:text-3xl">
                      <span className="gold-text">{c.name}</span>
                    </h3>
                    <div className="flex w-full max-w-md items-center gap-3">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--gold)_55%,transparent)] to-transparent" />
                      <span className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--gold)_55%,transparent)] to-transparent" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {catItems.map((item) => {
                      const key = item.id;
                      const qty = getPending(key);
                      const inCart = cart[key]?.qty ?? 0;
                      const hasDiscount =
                        item.discount_price != null && item.discount_price < item.price;
                      const price = hasDiscount ? item.discount_price! : item.price;
                      return (
                        <article
                          key={key}
                          className="glass-card group flex flex-col gap-4 overflow-hidden rounded-3xl transition-all hover:border-[color-mix(in_oklab,var(--gold)_50%,transparent)]"
                        >
                          <div className="relative aspect-[16/9] w-full overflow-hidden">
                            <img
                              src={item.image_url || ITEM_PLACEHOLDER}
                              alt={item.name}
                              width={800}
                              height={450}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {hasDiscount && (
                              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                <Sparkles className="h-3 w-3" /> عرض
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-4 p-5 pt-0 md:p-6 md:pt-0">
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
                              </div>
                              <div className="shrink-0 text-end">
                                <div className="gold-text font-display text-xl font-bold md:text-2xl">
                                  {price.toLocaleString()}
                                </div>
                                {hasDiscount && (
                                  <div className="text-[11px] text-foreground/50 line-through">
                                    {item.price.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-[10px] uppercase tracking-widest text-[var(--gold)]/70">
                                  د.ع
                                </div>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={notes[key] ?? ""}
                              onChange={(e) =>
                                setNotes((n) => ({ ...n, [key]: e.target.value }))
                              }
                              placeholder="ملاحظات (مثلاً: بدون مخلل)"
                              className="w-full rounded-2xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)]/50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-[var(--gold)] focus:outline-none"
                            />

                            <div className="flex items-center justify-between gap-3 border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] pt-4">
                              <div className="flex items-center gap-1 rounded-full gold-border p-1">
                                <button
                                  onClick={() => setPending(key, -1)}
                                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                                  aria-label="إنقاص"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-7 text-center font-bold tabular-nums">{qty}</span>
                                <button
                                  onClick={() => setPending(key, +1)}
                                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                                  aria-label="زيادة"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => addToCart(key)}
                                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all hover:scale-[1.02] ${
                                  justAdded === key
                                    ? "bg-[#25D366] text-white"
                                    : "bg-[var(--gold)] text-[var(--forest-deep)]"
                                }`}
                              >
                                <ShoppingBag className="h-4 w-4" />
                                {justAdded === key
                                  ? "تمت الإضافة ✓"
                                  : inCart > 0
                                    ? `إضافة (${inCart} في السلة)`
                                    : "أضف إلى السلة"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
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

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: UtensilsCrossed, value: `+${categories.length}`, label: "قسم في القائمة" },
              { icon: ChefHat, value: `+${items.length}`, label: "أطباق مميّزة" },
              { icon: Star, value: "5.0", label: "تقييم الزبائن" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card flex flex-col items-center gap-2 rounded-3xl p-7 transition-transform hover:-translate-y-1"
              >
                <s.icon className="h-7 w-7 text-[var(--gold)]" />
                <div className="gold-text font-display text-4xl font-bold">{s.value}</div>
                <div className="text-sm text-foreground/75">{s.label}</div>
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

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                title: "العنوان",
                lines: ["أبي الخصيب", "فلكة التجنيد مجاور جاليري مول"],
                href: "https://maps.google.com/?q=Abi+Al-Khasib+Basra",
              },
              {
                icon: Phone,
                title: "للطلب والاستفسار",
                lines: ["07756000241", "07878777237"],
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
                title: "واتساب",
                lines: ["تواصل مباشر"],
                href: WHATSAPP,
              },
            ].map((c) => (
              <a
                key={c.title}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card group flex flex-col items-center gap-3 rounded-3xl p-7 text-center transition-transform hover:-translate-y-1"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--gold)]/15 text-[var(--gold)] transition-colors group-hover:bg-[var(--gold)] group-hover:text-[var(--forest-deep)]">
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-lg font-bold">{c.title}</div>
                <div className="space-y-0.5 text-sm text-foreground/75">
                  {c.lines.map((l) => (
                    <div key={l}>{l}</div>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[var(--forest-deep)] px-4 py-10 text-center">
        <div className="mx-auto max-w-3xl">
          <img src={logoImg} alt="مطعم جبل" width={56} height={56} className="mx-auto h-14 w-14 rounded-full" />
          <p className="mt-5 text-sm leading-loose text-foreground/75">
            هنا تجد الطعم كما لم تذقه من قبل <span className="text-red-400">❤️</span>
          </p>
          <a
            href="/admin"
            className="mt-4 inline-block text-[10px] uppercase tracking-widest text-foreground/30 hover:text-[var(--gold)]"
          >
            لوحة التحكم
          </a>
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
        <MessageCircle className="h-6 w-6" />
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
                      className="glass-card flex items-center justify-between gap-3 rounded-2xl p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">{e.item.name}</div>
                        <div className="text-xs text-foreground/60">
                          {effectivePrice(e.item).toLocaleString()} د.ع × {e.qty}
                        </div>
                        {e.note && (
                          <div className="mt-1 text-xs text-[var(--gold)]/80">📝 {e.note}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 rounded-full gold-border p-1">
                        <button
                          onClick={() => setCartQty(e.key, -1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                          aria-label="إنقاص"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">{e.qty}</span>
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
