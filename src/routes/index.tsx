import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import logoImg from "@/assets/logo.png";
import catPizza from "@/assets/cat-pizza.jpg";
import catBurger from "@/assets/cat-burger.jpg";
import catSteak from "@/assets/cat-steak.jpg";
import catDolma from "@/assets/cat-dolma.jpg";
import catShawarma from "@/assets/cat-shawarma.jpg";
import catItalian from "@/assets/cat-italian.jpg";
import catAppetizers from "@/assets/cat-appetizers.jpg";

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

const WHATSAPP = "https://wa.me/9647756000241";
const PHONE_PRIMARY = "07756000241";

type MenuItem = { name: string; price: number; desc?: string };
type Category = {
  id: string;
  name: string;
  img: string;
  tag: string;
  items: MenuItem[];
};

const CATEGORIES: Category[] = [
  {
    id: "pizza",
    name: "بيتزا",
    tag: "إيطالي أصيل",
    img: catPizza,
    items: [
      { name: "بيتزا مارغريتا", price: 12000, desc: "صلصة طماطم، موزاريلا، ريحان طازج" },
      { name: "بيتزا بيبروني", price: 15000, desc: "موزاريلا، بيبروني، صلصة خاصة" },
      { name: "بيتزا جبل الخاصة", price: 18000, desc: "لحم، فطر، فلفل، زيتون، جبن" },
    ],
  },
  {
    id: "burger",
    name: "برغر",
    tag: "محضّر طازج",
    img: catBurger,
    items: [
      { name: "كلاسيك تشيز برغر", price: 10000, desc: "لحم بقري، شيدر، خس، طماطم" },
      { name: "دبل برغر", price: 14000, desc: "قطعتين لحم، جبن مزدوج، صلصة الشيف" },
      { name: "برغر جبل الفاخر", price: 16000, desc: "لحم واغيو، فطر مشوي، صوص الفلفل" },
    ],
  },
  {
    id: "steak",
    name: "ستيك",
    tag: "مشوي على الفحم",
    img: catSteak,
    items: [
      { name: "ريب آي ستيك", price: 35000, desc: "300غ، مع البطاطس والخضار المشوية" },
      { name: "تندرلوين", price: 40000, desc: "أنعم قطعة، صلصة الفلفل الأسود" },
      { name: "تي-بون ستيك", price: 45000, desc: "500غ، يكفي لشخصين" },
    ],
  },
  {
    id: "dolma",
    name: "دولمة",
    tag: "تراث عراقي",
    img: catDolma,
    items: [
      { name: "دولمة مشكّلة", price: 15000, desc: "ورق عنب، باذنجان، فلفل، كوسا" },
      { name: "دولمة باللحم", price: 18000, desc: "حشوة فاخرة باللحم والأرز" },
    ],
  },
  {
    id: "shawarma",
    name: "شاورما",
    tag: "على الفحم",
    img: catShawarma,
    items: [
      { name: "شاورما دجاج", price: 6000, desc: "خبز عربي، ثوم، مخلل، بطاطس" },
      { name: "شاورما لحم", price: 8000, desc: "لحم بقري متبّل، طحينة، طماطم" },
      { name: "صحن شاورما مشكّل", price: 14000, desc: "دجاج ولحم مع الأرز" },
    ],
  },
  {
    id: "italian",
    name: "إيطالي",
    tag: "باستا وريزوتو",
    img: catItalian,
    items: [
      { name: "باستا كاربونارا", price: 13000, desc: "كريمة، بانشيتا، بارميزان" },
      { name: "فيتوتشيني ألفريدو", price: 14000, desc: "صلصة كريمية، دجاج مشوي" },
      { name: "لازانيا باللحم", price: 16000, desc: "طبقات لحم وجبن، بشاميل" },
    ],
  },
  {
    id: "appetizers",
    name: "مقبلات",
    tag: "للبداية المثالية",
    img: catAppetizers,
    items: [
      { name: "حمص بالطحينة", price: 4000, desc: "زيت زيتون بكر، صنوبر" },
      { name: "متبّل باذنجان", price: 4000, desc: "محمّر على الفحم، رمان" },
      { name: "طبق مقبلات جبل", price: 9000, desc: "تشكيلة من 6 مقبلات" },
    ],
  },
];

const NAV_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#menu", label: "قائمتنا الفاخرة" },
  { href: "#about", label: "عن المطعم" },
  { href: "#contact", label: "تواصل" },
];

function HomePage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showCheckoutWarning, setShowCheckoutWarning] = useState(false);

  const setQty = (key: string, delta: number) =>
    setQuantities((q) => ({ ...q, [key]: Math.max(0, (q[key] ?? 0) + delta) }));

  const cartCount = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities],
  );

  // Build cart entries
  const cartEntries = useMemo(() => {
    const entries: { key: string; item: MenuItem; qty: number; note: string }[] = [];
    for (const c of CATEGORIES) {
      for (const item of c.items) {
        const key = `${c.id}-${item.name}`;
        const qty = quantities[key] ?? 0;
        if (qty > 0) entries.push({ key, item, qty, note: notes[key]?.trim() ?? "" });
      }
    }
    return entries;
  }, [quantities, notes]);

  const cartTotal = useMemo(
    () => cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0),
    [cartEntries],
  );

  const addToCart = (key: string) => {
    setQty(key, +1);
    // Subtle feedback: open cart briefly? keep closed; user opens via FAB
  };

  const sendCartToWhatsapp = () => {
    if (!customerPhone.trim() || !customerAddress.trim()) {
      setShowCheckoutWarning(true);
      return;
    }
    const lines = cartEntries.map(
      (e) =>
        `• ${e.item.name} × ${e.qty} = ${(e.item.price * e.qty).toLocaleString()} د.ع${
          e.note ? `\n   ملاحظة: ${e.note}` : ""
        }`,
    );
    const text =
      `مرحباً، أرغب بتقديم طلب من مطعم جبل:\n\n${lines.join("\n")}\n\n` +
      `المجموع: ${cartTotal.toLocaleString()} د.ع\n\n` +
      `الاسم: ${customerName || "—"}\nرقم الهاتف: ${customerPhone}\nالعنوان: ${customerAddress}`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const quickWhatsapp = () => {
    const text = "مرحباً، أرغب بالاستفسار عن مطعم جبل";
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[var(--forest)] text-foreground">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 border-b border-[color-mix(in_oklab,var(--gold)_18%,transparent)] bg-[color-mix(in_oklab,var(--forest-deep)_85%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
          {/* Nav (desktop) */}
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

          {/* Logo (center) */}
          <a href="#home" className="flex shrink-0 items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
            <img src={logoImg} alt="مطعم جبل" width={44} height={44} className="h-11 w-11 rounded-full" />
            <span className="gold-text font-display text-lg font-bold md:text-xl">
              مطعم جبل
            </span>
          </a>

          {/* Order button */}
          <div className="hidden flex-1 items-center justify-start md:flex">
            <a
              href={`tel:${PHONE_PRIMARY}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-[var(--forest-deep)] shadow-gold transition-transform hover:scale-105"
            >
              <Phone className="h-4 w-4" />
              اتصل للطلب
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="rounded-full gold-border p-2 text-[var(--gold)] md:hidden"
            aria-label="القائمة"
          >
            {navOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
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
            src={heroImg}
            alt="ستيك مشوي"
            width={1600}
            height={1100}
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--forest-deep)]/70 via-[var(--forest-deep)]/60 to-[var(--forest)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--gold)_15%,transparent),transparent_60%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center md:min-h-[68vh] md:py-20">
          <h1 className="mt-7 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl animate-fade-in">
            نكهات غريبة <span className="gold-text">بطعم مختلف</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-loose text-foreground/85 md:text-lg animate-fade-in">
            في مطعم جبل، نقدّم تجربة طعام تجمع بين الفن الغربي والذوق الشرقي،
            من الستيك المشوي إلى البيتزا الإيطالية، كل طبق يُحضّر بشغف ومكونات طازجة.
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

      {/* ============ MENU ============ */}
      <section id="menu" className="relative px-4 py-20 md:py-28">
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
            {CATEGORIES.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="group inline-flex flex-col items-center gap-1 rounded-2xl gold-border bg-[var(--forest-deep)] px-5 py-3 text-center shadow-card transition-transform hover:-translate-y-1 hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
              >
                <span className="text-[10px] uppercase tracking-widest text-[var(--gold)] group-hover:text-[var(--forest-deep)]">
                  {c.tag}
                </span>
                <span className="font-display text-base font-bold md:text-lg">
                  {c.name}
                </span>
              </a>
            ))}
          </div>

          {/* Items per category */}
          <div className="mt-20 space-y-20">
            {CATEGORIES.map((c) => (
              <div key={c.id} id={`cat-${c.id}`} className="scroll-mt-24">
                <div className="mb-8 text-center">
                  <h3 className="inline-block font-display text-2xl font-bold md:text-3xl">
                    <span className="gold-text">{c.name}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {c.items.map((item) => {
                    const key = `${c.id}-${item.name}`;
                    const qty = quantities[key] ?? 0;
                    return (
                      <article
                        key={key}
                        className="glass-card group flex flex-col gap-4 overflow-hidden rounded-3xl transition-all hover:border-[color-mix(in_oklab,var(--gold)_50%,transparent)]"
                      >
                        <div className="aspect-[16/9] w-full overflow-hidden">
                          <img
                            src={c.img}
                            alt={item.name}
                            width={800}
                            height={450}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>

                        <div className="flex flex-col gap-4 p-5 pt-0 md:p-6 md:pt-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display text-lg font-bold text-foreground md:text-xl">
                              {item.name}
                            </h4>
                            {item.desc && (
                              <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                                {item.desc}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-end">
                            <div className="gold-text font-display text-xl font-bold md:text-2xl">
                              {item.price.toLocaleString()}
                            </div>
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
                              onClick={() => setQty(key, -1)}
                              className="grid h-8 w-8 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                              aria-label="إنقاص"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-7 text-center font-bold tabular-nums">{qty}</span>
                            <button
                              onClick={() => setQty(key, +1)}
                              className="grid h-8 w-8 place-items-center rounded-full text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                              aria-label="زيادة"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => addToCart(key)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-[var(--forest-deep)] transition-transform hover:scale-[1.02]"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            أضف إلى السلة
                          </button>
                        </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
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
              { icon: UtensilsCrossed, value: "+8", label: "قسم في القائمة" },
              { icon: ChefHat, value: "+5", label: "أطباق مميّزة" },
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
                          {e.item.price.toLocaleString()} د.ع × {e.qty}
                        </div>
                        {e.note && (
                          <div className="mt-1 text-xs text-[var(--gold)]/80">📝 {e.note}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 rounded-full gold-border p-1">
                        <button
                          onClick={() => setQty(e.key, -1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                          aria-label="إنقاص"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">{e.qty}</span>
                        <button
                          onClick={() => setQty(e.key, +1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--forest-deep)]"
                          aria-label="زيادة"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => setQuantities((q) => ({ ...q, [e.key]: 0 }))}
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
                    type="text"
                    placeholder="الاسم (اختياري)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-4 py-2.5 text-sm focus:border-[var(--gold)] focus:outline-none"
                  />
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
