import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Crop, Upload, X, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("تعذر تحميل الصورة"));
    img.src = src;
  });
}

async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas غير مدعوم");
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("فشل إنشاء الصورة"))),
      "image/jpeg",
      0.92,
    ),
  );
}

export function ImageCropperModal({
  src,
  aspect = 1,
  cropShape = "rect",
  onCancel,
  onCropped,
}: {
  src: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  onCancel: () => void;
  onCropped: (blob: Blob) => void | Promise<void>;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const areaRef = useRef<Area | null>(null);

  const onComplete = useCallback((_: Area, px: Area) => {
    areaRef.current = px;
  }, []);

  const apply = async () => {
    if (!areaRef.current) return;
    setBusy(true);
    setErr(null);
    try {
      const blob = await getCroppedBlob(src, areaRef.current);
      await onCropped(blob);
    } catch (e: any) {
      setErr(e?.message ?? "فشل قص الصورة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4" dir="rtl">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--forest-deep)] gold-border">
        <div className="flex items-center justify-between border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] px-4 py-3">
          <span className="text-sm font-bold text-[var(--gold)]">تعديل وقص الصورة</span>
          <button onClick={onCancel} className="rounded-full p-1 text-foreground/70 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-[320px] w-full bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-[var(--gold)]" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--gold)]"
            />
          </div>
          {err && <div className="text-xs text-red-400">{err}</div>}
          <div className="flex items-center gap-2">
            <button
              onClick={apply}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-bold text-[var(--forest-deep)] disabled:opacity-50"
            >
              <Crop className="h-3.5 w-3.5" /> {busy ? "جاري الحفظ..." : "قص وحفظ"}
            </button>
            <button
              onClick={onCancel}
              className="rounded-full gold-border px-4 py-2 text-xs text-foreground/80"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Image field with built-in cropper for new uploads and for editing existing images.
 */
export function ImageField({
  value,
  onChange,
  folder,
  label = "صورة",
  aspect = 1,
  cropShape = "rect",
  previewClassName = "h-14 w-14 rounded-xl object-cover",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  previewClassName?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const uploadBlob = async (blob: Blob) => {
    setUploading(true);
    try {
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await sb.storage
        .from("menu-images")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
      const { data: pub } = sb.storage.from("menu-images").getPublicUrl(path);
      onChange(pub.publicUrl);
      setSrc(null);
    } catch (e: any) {
      alert("فشل الرفع: " + (e?.message ?? e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value ? (
        <img src={value} alt="" className={previewClassName} />
      ) : (
        <div className="grid h-14 w-14 place-items-center rounded-xl gold-border text-[10px] text-foreground/50">
          بدون صورة
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full gold-border px-3 py-1.5 text-xs text-[var(--gold)]">
        <Upload className="h-3.5 w-3.5" />
        {uploading ? "جاري الرفع..." : label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          onClick={() => setSrc(`${value}${value.includes("?") ? "&" : "?"}t=${Date.now()}`)}
          className="inline-flex items-center gap-1 rounded-full gold-border px-3 py-1.5 text-xs text-[var(--gold)]"
        >
          <Crop className="h-3.5 w-3.5" /> تعديل الصورة
        </button>
      )}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-red-400 hover:underline"
        >
          إزالة
        </button>
      )}
      {src && (
        <ImageCropperModal
          src={src}
          aspect={aspect}
          cropShape={cropShape}
          onCancel={() => setSrc(null)}
          onCropped={uploadBlob}
        />
      )}
    </div>
  );
}
