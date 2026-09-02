import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BACKGROUND_STYLES,
  Category,
  DeliveryArea,
  FONT_OPTIONS,
  MenuItem,
  Offer,
  RestaurantRating,
  ThemeSettings,
  applyTheme,
  fetchCategories,
  fetchDeliveryAreas,
  fetchMenuItems,
  fetchMenuItemOptions,
  fetchOffers,
  fetchRestaurantRatings,
  fetchTheme,
  MenuItemOption,
  DAY_NAMES,
  DEFAULT_HOURS,
  DEFAULT_CLOSED_MESSAGE,
  DayHours,
  OrderRow,
} from "@/lib/menuData";

import { LogOut, Plus, Save, Trash2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ImageField } from "@/components/ImageCropper";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم | مطعم جبل" }] }),
  component: AdminPage,
});

const sb = supabase as any;
const ADMIN_EMAIL_DOMAIN = "jabal.local";
const toEmail = (username: string) =>
  username.includes("@") ? username : `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.auth.getSession().then(({ data }: any) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e: any, s: any) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    sb.from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }: any) => setIsAdmin(!!data));
  }, [session]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-foreground/70">جاري التحميل…</div>
    );
  }

  if (!session) return <LoginScreen />;
  if (!isAdmin)
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">لا توجد صلاحية</h2>
          <p className="mt-2 text-foreground/70">
            هذا الحساب غير مخوّل بالدخول إلى لوحة التحكم.
          </p>
          <button
            onClick={() => sb.auth.signOut()}
            className="mt-4 rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-bold text-[var(--forest-deep)]"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );

  return <Dashboard onSignOut={() => sb.auth.signOut()} />;
}

function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const email = toEmail(username);
    try {
      if (mode === "signup") {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="glass-card w-full max-w-sm space-y-4 rounded-3xl p-7">
        <h1 className="gold-text text-center font-display text-2xl font-bold">
          {mode === "login" ? "تسجيل دخول الأدمن" : "إنشاء حساب الأدمن الأول"}
        </h1>
        <p className="text-center text-xs text-foreground/60">
          {mode === "signup"
            ? "يُمنح حساب الأدمن تلقائياً لأول مستخدم يسجل."
            : "أدخل بياناتك للدخول إلى لوحة التحكم."}
        </p>

        <div className="space-y-1">
          <label className="text-xs text-foreground/70">اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-4 py-2.5 text-sm focus:border-[var(--gold)] focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-foreground/70">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-4 py-2.5 text-sm focus:border-[var(--gold)] focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[var(--gold)] py-2.5 text-sm font-bold text-[var(--forest-deep)] disabled:opacity-50"
        >
          {busy ? "..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="block w-full text-center text-xs text-[var(--gold)] hover:underline"
        >
          {mode === "login" ? "إنشاء حساب الأدمن (أول مرة فقط)" : "لدي حساب — تسجيل دخول"}
        </button>
      </form>
    </div>
  );
}

/* ============ DASHBOARD ============ */

type Tab = "analytics" | "hours" | "categories" | "items" | "featured" | "offers" | "delivery" | "reviews" | "theme";

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="gold-text font-display text-2xl font-bold">لوحة التحكم</h1>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-full gold-border px-4 py-2 text-xs font-bold text-[var(--gold)]"
            >
              عرض الموقع
            </a>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-4 py-2 text-xs font-bold text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> خروج
            </button>
          </div>
        </header>

        <nav className="mb-6 rounded-full gold-border bg-[color-mix(in_oklab,var(--forest-deep)_85%,transparent)] p-1.5">
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                ["categories", "الأقسام"],
                ["items", "الأطباق"],
                ["featured", "الأكثر طلباً"],
                ["offers", "العروض"],
                ["delivery", "أماكن التوصيل"],
                ["reviews", "آراء الزبائن"],
                ["hours", "أوقات العمل"],
                ["analytics", "الإحصائيات"],
                ["theme", "المظهر"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  tab === id
                    ? "bg-[var(--gold)] text-[var(--forest-deep)]"
                    : "text-foreground/75 hover:text-[var(--gold)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {tab === "analytics" && <AnalyticsTab />}
        {tab === "hours" && <HoursTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "items" && <ItemsTab />}
        {tab === "featured" && <FeaturedTab />}
        {tab === "offers" && <OffersTab />}
        {tab === "delivery" && <DeliveryTab />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "theme" && <ThemeTab />}
      </div>
    </div>
  );
}

/* ============ CATEGORIES ============ */

function CategoriesTab() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("");

  const load = () => {
    setLoading(true);
    fetchCategories()
      .then(setCats)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!newName.trim()) return;
    const { error } = await sb.from("categories").insert({
      name: newName.trim(),
      tag: newTag.trim() || null,
      sort_order: cats.length + 1,
    });
    if (error) return alert("فشل الإضافة: " + error.message);
    setNewName("");
    setNewTag("");
    load();
  };

  const update = async (id: string, patch: Partial<Category>) => {
    const { error } = await sb.from("categories").update(patch).eq("id", id);
    if (error) alert("فشل الحفظ: " + error.message);
  };

  const remove = async (id: string) => {
    if (!confirm("حذف القسم وجميع أكلاته؟")) return;
    const { error } = await sb.from("categories").delete().eq("id", id);
    if (error) return alert("فشل الحذف: " + error.message);
    load();
  };

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-foreground/70">اسم القسم</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-foreground/70">وسم (اختياري)</label>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-[var(--forest-deep)]"
        >
          <Plus className="h-4 w-4" /> إضافة قسم
        </button>
      </div>

      <div className="space-y-2">
        {cats.map((c) => (
          <CategoryRow key={c.id} c={c} onSave={update} onDelete={remove} onMoved={load} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({
  c,
  onSave,
  onDelete,
  onMoved,
}: {
  c: Category;
  onSave: (id: string, patch: Partial<Category>) => Promise<void>;
  onDelete: (id: string) => void;
  onMoved: () => void;
}) {
  const [name, setName] = useState(c.name);
  const [tag, setTag] = useState(c.tag ?? "");
  const [sort, setSort] = useState(c.sort_order);
  const [visible, setVisible] = useState(c.visible !== false);
  const [imageUrl, setImageUrl] = useState<string | null>(c.image_url ?? null);

  return (
    <div className="glass-card flex flex-wrap items-end gap-3 rounded-2xl p-3">
      <ImageField
        value={imageUrl}
        onChange={setImageUrl}
        folder="categories"
        label="صورة القسم"
        aspect={1}
        cropShape="rect"
        previewClassName="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--gold)]/50"
      />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 min-w-[150px] rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="وسم"
        className="flex-1 min-w-[150px] rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <input
        type="number"
        value={sort}
        onChange={(e) => setSort(Number(e.target.value))}
        className="w-20 rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <label className="inline-flex items-center gap-1.5 rounded-full gold-border px-3 py-1.5 text-xs text-foreground/80">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
        />
        {visible ? "ظاهر في الموقع" : "مخفي"}
      </label>
      <button
        onClick={async () => {
          await onSave(c.id, {
            name,
            tag: tag || null,
            sort_order: sort,
            visible,
            image_url: imageUrl,
          });
          onMoved();
        }}
        className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[var(--forest-deep)]"
      >
        <Save className="h-3.5 w-3.5" /> حفظ
      </button>
      <button
        onClick={() => onDelete(c.id)}
        className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-2 text-xs font-bold text-white"
      >
        <Trash2 className="h-3.5 w-3.5" /> حذف
      </button>
    </div>
  );
}


/* ============ ITEMS ============ */

function ItemsTab() {
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | "">("");

  const load = () => {
    setLoading(true);
    Promise.all([fetchCategories(), fetchMenuItems()])
      .then(([c, i]) => {
        setCats(c);
        setItems(i);
        if (!activeCat && c[0]) setActiveCat(c[0].id);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(
    () => items.filter((i) => !activeCat || i.category_id === activeCat),
    [items, activeCat],
  );

  const addItem = async () => {
    if (!activeCat) return alert("اختر قسماً أولاً");
    await sb.from("menu_items").insert({
      category_id: activeCat,
      name: "أكلة جديدة",
      price: 0,
      sort_order: filtered.length + 1,
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الأكلة؟")) return;
    await sb.from("menu_items").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={activeCat}
          onChange={(e) => setActiveCat(e.target.value)}
          className="rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
        >
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-[var(--forest-deep)]"
        >
          <Plus className="h-4 w-4" /> إضافة أكلة
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((it) => (
          <ItemCard key={it.id} item={it} onDelete={remove} onSaved={load} />
        ))}
      </div>
    </div>
  );
}

function ItemCard({
  item,
  onDelete,
  onSaved,
}: {
  item: MenuItem;
  onDelete: (id: string) => void;
  onSaved: () => void;
}) {
  const [m, setM] = useState(item);
  const [savedAt, setSavedAt] = useState(0);

  const save = async () => {
    const { error } = await sb
      .from("menu_items")
      .update({
        name: m.name,
        description: m.description,
        price: m.price,
        discount_price: m.discount_price,
        image_url: m.image_url,
        sort_order: m.sort_order,
        available: m.available,
        featured: m.featured ?? false,
      })
      .eq("id", m.id);
    if (error) return alert("فشل الحفظ: " + error.message);
    setSavedAt(Date.now());
    onSaved();
  };

  return (
    <div className="glass-card space-y-3 rounded-2xl p-4">
      {m.image_url && (
        <img
          src={m.image_url}
          alt={m.name}
          className="h-32 w-full rounded-xl object-cover"
        />
      )}
      <ImageField
        value={m.image_url}
        onChange={(url) => setM({ ...m, image_url: url })}
        folder="items"
        label="صورة الطبق"
        aspect={4 / 3}
        previewClassName="h-14 w-20 rounded-lg object-cover"
      />

      <input
        value={m.name}
        onChange={(e) => setM({ ...m, name: e.target.value })}
        placeholder="الاسم"
        className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <textarea
        value={m.description ?? ""}
        onChange={(e) => setM({ ...m, description: e.target.value })}
        placeholder="الوصف"
        rows={2}
        className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-foreground/70">السعر</label>
          <input
            type="number"
            value={m.price}
            onChange={(e) => setM({ ...m, price: Number(e.target.value) })}
            className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
          />
        </div>
        <div>
          <label className="text-xs text-foreground/70">سعر العرض</label>
          <input
            type="number"
            value={m.discount_price ?? ""}
            onChange={(e) =>
              setM({ ...m, discount_price: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
          />
        </div>
        <div>
          <label className="text-xs text-foreground/70">الترتيب</label>
          <input
            type="number"
            value={m.sort_order}
            onChange={(e) => setM({ ...m, sort_order: Number(e.target.value) })}
            className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
          />
        </div>
      </div>
      <OptionsEditor itemId={m.id} />

      <label className="flex items-center gap-2 text-xs text-foreground/80">
        <input
          type="checkbox"
          checked={m.available}
          onChange={(e) => setM({ ...m, available: e.target.checked })}
        />
        متوفر
      </label>
      <label className="flex items-center gap-2 text-xs text-foreground/80">
        <input
          type="checkbox"
          checked={m.featured ?? false}
          onChange={(e) => setM({ ...m, featured: e.target.checked })}
        />
        🔥 الأكثر طلباً
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[var(--forest-deep)]"
        >
          <Save className="h-3.5 w-3.5" /> حفظ
        </button>
        <button
          onClick={() => onDelete(m.id)}
          className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-2 text-xs font-bold text-white"
        >
          <Trash2 className="h-3.5 w-3.5" /> حذف
        </button>
        {savedAt > 0 && Date.now() - savedAt < 2000 && (
          <span className="text-xs text-green-400">تم الحفظ ✓</span>
        )}
      </div>
    </div>
  );
}

/* ============ MENU ITEM OPTIONS ============ */

function OptionsEditor({ itemId }: { itemId: string }) {
  const [opts, setOpts] = useState<MenuItemOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMenuItemOptions()
      .then((all) => setOpts(all.filter((o) => o.menu_item_id === itemId)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [itemId]);

  const add = async () => {
    const { error } = await sb.from("menu_item_options").insert({
      menu_item_id: itemId,
      name: "",
      price: 0,
      sort_order: opts.length + 1,
    });
    if (error) return alert("فشل الإضافة: " + error.message);
    load();
  };

  const save = async (id: string, patch: Partial<MenuItemOption>) => {
    const { error } = await sb.from("menu_item_options").update(patch).eq("id", id);
    if (error) alert("فشل الحفظ: " + error.message);
  };

  const remove = async (id: string) => {
    const { error } = await sb.from("menu_item_options").delete().eq("id", id);
    if (error) return alert("فشل الحذف: " + error.message);
    load();
  };

  return (
    <div className="rounded-xl border border-[color-mix(in_oklab,var(--gold)_20%,transparent)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--gold)]">
          خيارات المنتج (مثل: صغير، وسط، كبير)
        </span>
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[11px] font-bold text-[var(--forest-deep)]"
        >
          <Plus className="h-3 w-3" /> إضافة خيار
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-foreground/60">جاري التحميل…</div>
      ) : opts.length === 0 ? (
        <div className="text-[11px] text-foreground/50">
          لا توجد خيارات. اضغط "إضافة خيار" لإضافة صغير/وسط/كبير أو أي مقاسات تريد.
        </div>
      ) : (
        <div className="space-y-2">
          {opts.map((o) => (
            <OptionRow key={o.id} opt={o} onSave={save} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  opt,
  onSave,
  onDelete,
}: {
  opt: MenuItemOption;
  onSave: (id: string, patch: Partial<MenuItemOption>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(opt.name);
  const [price, setPrice] = useState(opt.price);
  const commit = () => onSave(opt.id, { name, price });

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        placeholder="اسم الخيار"
        className="flex-1 rounded-lg bg-[var(--forest-deep)] px-2.5 py-1.5 text-xs gold-border"
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        onBlur={commit}
        placeholder="السعر"
        className="w-24 rounded-lg bg-[var(--forest-deep)] px-2.5 py-1.5 text-xs gold-border"
      />
      <span className="text-[10px] text-[var(--gold)]/70">د.ع</span>
      <button
        onClick={() => onDelete(opt.id)}
        className="grid h-7 w-7 place-items-center rounded-full text-red-400 hover:bg-red-500/10"
        aria-label="حذف"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ============ FEATURED (الأكثر طلباً) ============ */

function FeaturedTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pick, setPick] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([fetchMenuItems(), fetchCategories(), fetchTheme()])
      .then(([its, cs, t]) => {
        setItems(its);
        setCats(cs);
        setEnabled(((t as any)?.featured_enabled ?? true) as boolean);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? "";
  const featured = items.filter((it) => (it as any).featured);
  const rest = items.filter((it) => !(it as any).featured);

  const setFeatured = async (id: string, value: boolean) => {
    setSaving(true);
    const { error } = await sb.from("menu_items").update({ featured: value }).eq("id", id);
    setSaving(false);
    if (error) return alert("خطأ: " + error.message);
    setItems((cur) => cur.map((i) => (i.id === id ? ({ ...i, featured: value } as MenuItem) : i)));
  };

  const toggleSection = async (value: boolean) => {
    setEnabled(value);
    const { error } = await sb
      .from("theme_settings")
      .update({ featured_enabled: value })
      .eq("id", 1);
    if (error) alert("خطأ: " + error.message);
  };

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;

  return (
    <div className="space-y-5">
      <div className="glass-card flex items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <div className="font-display font-bold text-foreground">إظهار قسم "🔥 الأكثر طلباً"</div>
          <div className="text-xs text-foreground/60">تحكم بإظهار أو إخفاء القسم من الصفحة الرئيسية</div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--gold)]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => toggleSection(e.target.checked)}
            className="h-5 w-5 accent-[var(--gold)]"
          />
          {enabled ? "ظاهر" : "مخفي"}
        </label>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="mb-3 font-display font-bold text-foreground">إضافة طبق للقسم</div>
        <div className="flex flex-wrap gap-2">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="min-w-[220px] flex-1 rounded-xl bg-black/20 px-3 py-2 text-sm text-foreground gold-border"
          >
            <option value="">اختر طبقاً…</option>
            {rest.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} — {catName(it.category_id)}
              </option>
            ))}
          </select>
          <button
            disabled={!pick || saving}
            onClick={async () => {
              await setFeatured(pick, true);
              setPick("");
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-[var(--forest-deep)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> إضافة
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="mb-3 font-display font-bold text-foreground">
          الأطباق المختارة ({featured.length})
        </div>
        {featured.length === 0 ? (
          <div className="text-sm text-foreground/60">لا توجد أطباق مختارة بعد.</div>
        ) : (
          <div className="space-y-2">
            {featured.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-xl bg-black/20 p-2"
              >
                {it.image_url && (
                  <img
                    src={it.image_url}
                    alt={it.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{it.name}</div>
                  <div className="text-xs text-foreground/60">{catName(it.category_id)}</div>
                </div>
                <select
                  value={it.id}
                  onChange={async (e) => {
                    const next = e.target.value;
                    if (next === it.id) return;
                    await setFeatured(it.id, false);
                    await setFeatured(next, true);
                  }}
                  className="rounded-xl bg-black/30 px-2 py-1 text-xs text-foreground gold-border"
                >
                  <option value={it.id}>استبدال بـ…</option>
                  {rest.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFeatured(it.id, false)}
                  className="rounded-full bg-red-500/80 p-2 text-white"
                  title="إزالة"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ OFFERS ============ */

function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchOffers()
      .then(setOffers)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    await sb.from("offers").insert({
      title: "عرض جديد",
      description: "وصف العرض",
      badge: "خصم",
      active: true,
      sort_order: offers.length + 1,
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف العرض؟")) return;
    await sb.from("offers").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;

  return (
    <div className="space-y-4">
      <button
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-[var(--forest-deep)]"
      >
        <Plus className="h-4 w-4" /> إضافة عرض
      </button>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {offers.map((o) => (
          <OfferCard key={o.id} offer={o} onDelete={remove} onSaved={load} />
        ))}
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  onDelete,
  onSaved,
}: {
  offer: Offer;
  onDelete: (id: string) => void;
  onSaved: () => void;
}) {
  const [o, setO] = useState(offer);
  const save = async () => {
    await sb
      .from("offers")
      .update({
        title: o.title,
        description: o.description,
        badge: o.badge,
        active: o.active,
        sort_order: o.sort_order,
      })
      .eq("id", o.id);
    onSaved();
  };
  return (
    <div className="glass-card space-y-2 rounded-2xl p-4">
      <input
        value={o.title}
        onChange={(e) => setO({ ...o, title: e.target.value })}
        placeholder="عنوان العرض"
        className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <textarea
        value={o.description ?? ""}
        onChange={(e) => setO({ ...o, description: e.target.value })}
        placeholder="وصف"
        rows={2}
        className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <input
        value={o.badge ?? ""}
        onChange={(e) => setO({ ...o, badge: e.target.value })}
        placeholder="شارة (مثال: خصم 20%)"
        className="w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
      />
      <label className="flex items-center gap-2 text-xs text-foreground/80">
        <input
          type="checkbox"
          checked={o.active}
          onChange={(e) => setO({ ...o, active: e.target.checked })}
        />
        مفعّل
      </label>
      <div className="flex gap-2">
        <button
          onClick={save}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[var(--forest-deep)]"
        >
          <Save className="h-3.5 w-3.5" /> حفظ
        </button>
        <button
          onClick={() => onDelete(o.id)}
          className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-2 text-xs font-bold text-white"
        >
          <Trash2 className="h-3.5 w-3.5" /> حذف
        </button>
      </div>
    </div>
  );
}

/* ============ THEME ============ */

function ThemeTab() {
  const [t, setT] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [savedAt, setSavedAt] = useState(0);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    fetchTheme()
      .then(setT)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !t) return <div className="text-foreground/70">جاري التحميل…</div>;

  const save = async () => {
    setSaveErr(null);
    const { error } = await sb.from("theme_settings").update(t).eq("id", 1);
    if (error) {
      setSaveErr(error.message || "فشل الحفظ");
      return;
    }
    setSavedAt(Date.now());
    applyTheme(t);
  };



  const colorField = (label: string, k: "forest_color" | "forest_deep_color" | "gold_color") => (
    <div key={k}>
      <label className="text-xs text-foreground/70">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={(t[k] as string) ?? "#000000"}
          onChange={(e) => setT({ ...t, [k]: e.target.value } as ThemeSettings)}
          className="h-10 w-14 cursor-pointer rounded border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-transparent"
        />
        <input
          value={(t[k] as string) ?? ""}
          onChange={(e) => setT({ ...t, [k]: e.target.value } as ThemeSettings)}
          className="flex-1 rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
        />
      </div>
    </div>
  );

  return (
    <div className="glass-card space-y-4 rounded-2xl p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {colorField("الأخضر الأساسي", "forest_color")}
        {colorField("الأخضر الداكن", "forest_deep_color")}
        {colorField("الذهبي", "gold_color")}
      </div>


      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs text-foreground/70">نمط الخلفية</label>
          <select
            value={t.background_style}
            onChange={(e) => setT({ ...t, background_style: e.target.value })}
            className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
          >
            {Object.keys(BACKGROUND_STYLES).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-foreground/70">الخط (Font Family)</label>
          <select
            value={t.font_family ?? "Lemonada"}
            onChange={(e) => setT({ ...t, font_family: e.target.value })}
            style={{ fontFamily: `"${t.font_family}", sans-serif` }}
            className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: `"${f.value}", sans-serif` }}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>


      <div>
        <label className="text-xs text-foreground/70">عنوان الهيرو</label>
        <input
          value={t.hero_title ?? ""}
          onChange={(e) => setT({ ...t, hero_title: e.target.value })}
          className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
        />
      </div>
      <div>
        <label className="text-xs text-foreground/70">نص الهيرو</label>
        <textarea
          value={t.hero_subtitle ?? ""}
          onChange={(e) => setT({ ...t, hero_subtitle: e.target.value })}
          rows={2}
          className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
        />
      </div>

      <div>
        <label className="text-xs text-foreground/70">نص التذييل (Footer)</label>
        <input
          value={t.footer_text ?? ""}
          onChange={(e) => setT({ ...t, footer_text: e.target.value })}
          placeholder="مثال: مطعم جبل 2026 — جميع الحقوق محفوظة"
          className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
        />
      </div>

      <div>
        <label className="text-xs text-foreground/70">رابط الموقع على الخريطة (Google Maps)</label>
        <input
          value={(t as any).location_url ?? ""}
          onChange={(e) => setT({ ...t, location_url: e.target.value } as any)}
          placeholder="https://maps.google.com/?q=..."
          dir="ltr"
          className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
        />
      </div>

      <div>
        <label className="text-xs text-foreground/70">صورة الهيرو</label>
        <div className="mt-1">
          <ImageField
            value={t.hero_image_url}
            onChange={(url) => setT({ ...t, hero_image_url: url })}
            folder="hero"
            label="رفع صورة"
            aspect={16 / 9}
            previewClassName="h-14 w-24 rounded object-cover"
          />
        </div>
      </div>


      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-bold text-[var(--forest-deep)]"
        >
          <Save className="h-4 w-4" /> حفظ المظهر
        </button>
        {savedAt > 0 && Date.now() - savedAt < 2500 && (
          <span className="text-xs text-green-400">تم الحفظ ✓</span>
        )}
        {saveErr && <span className="text-xs text-red-400">خطأ: {saveErr}</span>}
      </div>
    </div>
  );
}


/* ============ DELIVERY AREAS ============ */

function DeliveryTab() {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);

  const load = () => {
    setLoading(true);
    fetchDeliveryAreas()
      .then(setAreas)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!newName.trim()) return;
    const { error } = await sb.from("delivery_areas").insert({
      name: newName.trim(),
      price: Number(newPrice) || 0,
      sort_order: areas.length + 1,
    });
    if (error) return alert("فشل الإضافة: " + error.message);
    setNewName("");
    setNewPrice(0);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف منطقة التوصيل؟")) return;
    const { error } = await sb.from("delivery_areas").delete().eq("id", id);
    if (error) return alert("فشل الحذف: " + error.message);
    load();
  };

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <div className="min-w-[180px] flex-1">
          <label className="text-xs text-foreground/70">اسم المنطقة</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
          />
        </div>
        <div className="w-36">
          <label className="text-xs text-foreground/70">سعر التوصيل (د.ع)</label>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-[var(--forest-deep)]"
        >
          <Plus className="h-4 w-4" /> إضافة منطقة
        </button>
      </div>

      <div className="space-y-2">
        {areas.map((a) => (
          <AreaRow key={a.id} a={a} onDelete={remove} />
        ))}
        {areas.length === 0 && (
          <div className="text-sm text-foreground/60">لا توجد مناطق توصيل بعد.</div>
        )}
      </div>
    </div>
  );
}

function AreaRow({ a, onDelete }: { a: DeliveryArea; onDelete: (id: string) => void }) {
  const [name, setName] = useState(a.name);
  const [price, setPrice] = useState(a.price);
  const [sort, setSort] = useState(a.sort_order);
  const [active, setActive] = useState(a.active);

  const save = async () => {
    const { error } = await sb
      .from("delivery_areas")
      .update({ name, price: Number(price) || 0, sort_order: Number(sort) || 0, active })
      .eq("id", a.id);
    if (error) alert("فشل الحفظ: " + error.message);
  };

  return (
    <div className="glass-card flex flex-wrap items-end gap-3 rounded-2xl p-3">
      <div className="min-w-[160px] flex-1">
        <label className="text-[10px] text-foreground/60">المنطقة</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
        />
      </div>
      <div className="w-28">
        <label className="text-[10px] text-foreground/60">السعر</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
        />
      </div>
      <div className="w-20">
        <label className="text-[10px] text-foreground/60">الترتيب</label>
        <input
          type="number"
          value={sort}
          onChange={(e) => setSort(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-1.5 text-xs text-foreground/80">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        مفعّلة
      </label>
      <button
        onClick={save}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[var(--forest-deep)]"
      >
        <Save className="h-3.5 w-3.5" /> حفظ
      </button>
      <button
        onClick={() => onDelete(a.id)}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/50 px-3 py-2 text-xs font-bold text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" /> حذف
      </button>
    </div>
  );
}

/* ============ CUSTOMER REVIEWS ============ */

function ReviewsTab() {
  const [rows, setRows] = useState<RestaurantRating[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchRestaurantRatings()
      .then(setRows)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const patch = async (id: string, p: Record<string, unknown>) => {
    const { error } = await sb.from("restaurant_ratings").update(p).eq("id", id);
    if (error) return alert("فشل الحفظ: " + error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الرأي نهائياً؟")) return;
    const { error } = await sb.from("restaurant_ratings").delete().eq("id", id);
    if (error) return alert("فشل الحذف: " + error.message);
    load();
  };

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;
  if (rows.length === 0)
    return <div className="text-sm text-foreground/60">لا توجد آراء بعد.</div>;

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <ReviewRow key={r.id} r={r} onPatch={patch} onDelete={remove} />
      ))}
    </div>
  );
}

function ReviewRow({
  r,
  onPatch,
  onDelete,
}: {
  r: RestaurantRating;
  onPatch: (id: string, p: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [comment, setComment] = useState(r.comment ?? "");

  return (
    <div className="glass-card space-y-2 rounded-2xl p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[var(--gold)]">{"★".repeat(r.stars)}</span>
        <span className="text-foreground/50">
          {new Date(r.created_at).toLocaleDateString("ar-IQ")}
        </span>
        {r.hidden && <span className="text-red-400">مخفي</span>}
        {r.pinned && <span className="text-[var(--gold)]">مثبّت</span>}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-[color-mix(in_oklab,var(--gold)_25%,transparent)] bg-[var(--forest-deep)] px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPatch(r.id, { comment: comment.trim() || null })}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1.5 text-xs font-bold text-[var(--forest-deep)]"
        >
          <Save className="h-3.5 w-3.5" /> حفظ النص
        </button>
        <button
          onClick={() => onPatch(r.id, { hidden: !r.hidden })}
          className="rounded-full gold-border px-3 py-1.5 text-xs font-bold text-[var(--gold)]"
        >
          {r.hidden ? "إظهار" : "إخفاء"}
        </button>
        <button
          onClick={() => onPatch(r.id, { pinned: !r.pinned })}
          className="rounded-full gold-border px-3 py-1.5 text-xs font-bold text-[var(--gold)]"
        >
          {r.pinned ? "إلغاء التثبيت" : "تثبيت في الأعلى"}
        </button>
        <button
          onClick={() => onDelete(r.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-500/50 px-3 py-1.5 text-xs font-bold text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" /> حذف
        </button>
      </div>
    </div>
  );
}

/* ============ OPERATING HOURS ============ */

function HoursTab() {
  const [t, setT] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchTheme()
      .then(setT)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !t) return <div className="text-foreground/70">جاري التحميل…</div>;

  const hours: DayHours[] =
    Array.isArray(t.opening_hours) && t.opening_hours.length === 7
      ? (t.opening_hours as DayHours[])
      : DEFAULT_HOURS;

  const setDay = (i: number, patch: Partial<DayHours>) => {
    const next = hours.map((d, idx) => (idx === i ? { ...d, ...patch } : d));
    setT({ ...t, opening_hours: next });
  };

  const save = async () => {
    setErr(null);
    const { error } = await sb
      .from("theme_settings")
      .update({
        opening_hours: hours,
        manual_closed: !!t.manual_closed,
        closed_message: t.closed_message || DEFAULT_CLOSED_MESSAGE,
      })
      .eq("id", 1);
    if (error) return setErr(error.message);
    setSavedAt(Date.now());
  };

  const applyToAll = () => {
    const first = hours[0];
    setT({ ...t, opening_hours: hours.map(() => ({ ...first })) });
  };

  return (
    <div className="space-y-4">
      <div
        className={`glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 ${
          t.manual_closed ? "border border-red-500/50" : ""
        }`}
      >
        <div>
          <div className="text-sm font-bold text-foreground">إغلاق يدوي — المطعم مغلق حالياً</div>
          <p className="mt-1 text-xs text-foreground/60">
            عند التفعيل يتم إغلاق استقبال الطلبات فوراً بغض النظر عن أوقات العمل.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setT({ ...t, manual_closed: !t.manual_closed })}
          className={`relative h-8 w-16 shrink-0 rounded-full transition-colors ${
            t.manual_closed ? "bg-red-500" : "bg-[var(--forest-deep)] gold-border"
          }`}
          aria-pressed={!!t.manual_closed}
          aria-label="إغلاق يدوي"
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-[var(--gold)] transition-all ${
              t.manual_closed ? "start-1" : "end-1"
            }`}
          />
        </button>
      </div>

      <div className="glass-card space-y-2 rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--gold)]">أوقات العمل الأسبوعية</span>
          <button
            onClick={applyToAll}
            className="rounded-full gold-border px-3 py-1.5 text-[11px] text-[var(--gold)]"
          >
            تطبيق توقيت الأحد على كل الأيام
          </button>
        </div>
        {hours.map((d, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl gold-border p-2">
            <span className="w-20 text-xs font-bold">{DAY_NAMES[i]}</span>
            <label className="flex items-center gap-1 text-[11px] text-foreground/70">
              <input
                type="checkbox"
                checked={!d.closed}
                onChange={(e) => setDay(i, { closed: !e.target.checked })}
              />
              مفتوح
            </label>
            <input
              type="time"
              value={d.open}
              disabled={d.closed}
              onChange={(e) => setDay(i, { open: e.target.value })}
              className="rounded-lg bg-[var(--forest-deep)] px-2 py-1.5 text-xs gold-border disabled:opacity-40"
            />
            <span className="text-xs text-foreground/50">إلى</span>
            <input
              type="time"
              value={d.close}
              disabled={d.closed}
              onChange={(e) => setDay(i, { close: e.target.value })}
              className="rounded-lg bg-[var(--forest-deep)] px-2 py-1.5 text-xs gold-border disabled:opacity-40"
            />
          </div>
        ))}
        <div className="pt-2">
          <label className="text-xs text-foreground/70">رسالة الإغلاق</label>
          <input
            value={t.closed_message ?? DEFAULT_CLOSED_MESSAGE}
            onChange={(e) => setT({ ...t, closed_message: e.target.value })}
            className="mt-1 w-full rounded-lg bg-[var(--forest-deep)] px-3 py-2 text-sm gold-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-bold text-[var(--forest-deep)]"
        >
          <Save className="h-4 w-4" /> حفظ أوقات العمل
        </button>
        {savedAt > 0 && Date.now() - savedAt < 2500 && (
          <span className="text-xs text-green-400">تم الحفظ ✓</span>
        )}
        {err && <span className="text-xs text-red-400">خطأ: {err}</span>}
      </div>
    </div>
  );
}

/* ============ ANALYTICS ============ */

const iqd = (n: number) => `${Math.round(n).toLocaleString()} د.ع`;

function AnalyticsTab() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"today" | "month">("today");

  useEffect(() => {
    sb.from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3000)
      .then(({ data }: any) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    let todayCount = 0,
      todayRevenue = 0,
      monthCount = 0,
      monthRevenue = 0,
      prevCount = 0,
      prevRevenue = 0;

    const daily: { day: string; ts: number; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(startOfToday - i * 86_400_000);
      daily.push({
        day: `${d.getDate()}/${d.getMonth() + 1}`,
        ts: d.getTime(),
        orders: 0,
        revenue: 0,
      });
    }
    const monthly: { label: string; ts: number; orders: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthly.push({
        label: `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`,
        ts: d.getTime(),
        orders: 0,
        revenue: 0,
      });
    }

    const topToday = new Map<string, { name: string; qty: number; revenue: number }>();
    const topMonth = new Map<string, { name: string; qty: number; revenue: number }>();

    for (const o of orders) {
      const ts = new Date(o.created_at).getTime();
      const total = Number(o.total) || 0;
      if (ts >= startOfToday) {
        todayCount++;
        todayRevenue += total;
      }
      if (ts >= startOfMonth) {
        monthCount++;
        monthRevenue += total;
      } else if (ts >= startOfPrevMonth) {
        prevCount++;
        prevRevenue += total;
      }
      for (let i = daily.length - 1; i >= 0; i--) {
        if (ts >= daily[i].ts) {
          if (ts < daily[i].ts + 86_400_000) {
            daily[i].orders++;
            daily[i].revenue += total;
          }
          break;
        }
      }
      for (let i = monthly.length - 1; i >= 0; i--) {
        if (ts >= monthly[i].ts) {
          monthly[i].orders++;
          monthly[i].revenue += total;
          break;
        }
      }
      const lines = Array.isArray(o.items) ? o.items : [];
      for (const l of lines as any[]) {
        const key = String(l?.name ?? l?.id ?? "");
        if (!key) continue;
        const qty = Number(l?.qty) || 0;
        const rev = qty * (Number(l?.unit_price) || 0);
        const bump = (m: Map<string, { name: string; qty: number; revenue: number }>) => {
          const cur = m.get(key) ?? { name: key, qty: 0, revenue: 0 };
          cur.qty += qty;
          cur.revenue += rev;
          m.set(key, cur);
        };
        if (ts >= startOfToday) bump(topToday);
        if (ts >= startOfMonth) bump(topMonth);
      }
    }

    const sortTop = (m: Map<string, { name: string; qty: number; revenue: number }>) =>
      [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);

    return {
      todayCount,
      todayRevenue,
      monthCount,
      monthRevenue,
      prevCount,
      prevRevenue,
      daily,
      monthly,
      topToday: sortTop(topToday),
      topMonth: sortTop(topMonth),
    };
  }, [orders]);

  if (loading) return <div className="text-foreground/70">جاري التحميل…</div>;

  const delta =
    stats.prevRevenue > 0
      ? ((stats.monthRevenue - stats.prevRevenue) / stats.prevRevenue) * 100
      : null;

  const card = (label: string, value: string, hint?: string) => (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-[11px] text-foreground/60">{label}</div>
      <div className="gold-text mt-1 font-display text-xl font-bold">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] text-foreground/50">{hint}</div>}
    </div>
  );

  const top = scope === "today" ? stats.topToday : stats.topMonth;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {card("طلبات اليوم", String(stats.todayCount))}
        {card("مبيعات اليوم", iqd(stats.todayRevenue))}
        {card("طلبات هذا الشهر", String(stats.monthCount), `الشهر الماضي: ${stats.prevCount}`)}
        {card(
          "مبيعات هذا الشهر",
          iqd(stats.monthRevenue),
          delta === null
            ? `الشهر الماضي: ${iqd(stats.prevRevenue)}`
            : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}% مقارنة بالشهر الماضي`,
        )}
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="mb-3 text-sm font-bold text-[var(--gold)]">مبيعات آخر 14 يوم</div>
        <div className="h-56 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,189,89,0.12)" />
              <XAxis dataKey="day" tick={{ fill: "#cbd5c0", fontSize: 10 }} />
              <YAxis tick={{ fill: "#cbd5c0", fontSize: 10 }} width={60} />
              <Tooltip
                contentStyle={{
                  background: "var(--forest-deep)",
                  border: "1px solid rgba(255,189,89,0.35)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: any, k: any) => [k === "revenue" ? iqd(Number(v)) : v, k === "revenue" ? "المبيعات" : "الطلبات"]}
              />
              <Bar dataKey="revenue" fill="#ffbd59" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="mb-3 text-sm font-bold text-[var(--gold)]">اتجاه المبيعات الشهري</div>
        <div className="h-56 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,189,89,0.12)" />
              <XAxis dataKey="label" tick={{ fill: "#cbd5c0", fontSize: 10 }} />
              <YAxis tick={{ fill: "#cbd5c0", fontSize: 10 }} width={60} />
              <Tooltip
                contentStyle={{
                  background: "var(--forest-deep)",
                  border: "1px solid rgba(255,189,89,0.35)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: any) => iqd(Number(v))}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ffbd59" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-[var(--gold)]">الأطباق الأكثر مبيعاً</span>
          <div className="flex gap-2">
            {(
              [
                ["today", "اليوم"],
                ["month", "هذا الشهر"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setScope(id)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  scope === id
                    ? "bg-[var(--gold)] text-[var(--forest-deep)]"
                    : "gold-border text-foreground/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {top.length === 0 ? (
          <div className="text-sm text-foreground/60">لا توجد مبيعات في هذه الفترة.</div>
        ) : (
          <div className="space-y-1.5">
            {top.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-xl gold-border px-3 py-2 text-xs"
              >
                <span className="font-bold">
                  {i + 1}. {d.name}
                </span>
                <span className="text-foreground/70">
                  {d.qty} طلب · {iqd(d.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
