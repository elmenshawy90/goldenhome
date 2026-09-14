"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow, ProductRow } from "@/lib/store";

type Props = {
  categories: CategoryRow[];
  initial?: ProductRow | null;
  editId?: string;
};

export default function ProductForm({ categories, initial, editId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState<{
    name: string;
    categoryId: string;
    description: string;
    price: number;
    oldPrice: number | "";
    discountPercentage: number;
    isOnSale: boolean;
    size: string;
    color: string;
    material: string;
    specifications: string;
    availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
    isFeatured: boolean;
    isNew: boolean;
    isActive: boolean;
  }>({
    name: initial?.name ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    oldPrice: initial?.oldPrice ?? "",
    discountPercentage: initial?.discountPercentage ?? 0,
    isOnSale: initial?.isOnSale ?? false,
    size: initial?.size ?? "",
    color: initial?.color ?? "",
    material: initial?.material ?? "",
    specifications: initial?.specifications ?? "",
    availability: initial?.availability ?? "IN_STOCK",
    isFeatured: initial?.isFeatured ?? false,
    isNew: initial?.isNew ?? false,
    isActive: initial?.isActive ?? true,
  });
  const [imagesText, setImagesText] = useState(
    (initial?.images ?? []).map((i) => i.url).join("\n")
  );
  const [previews, setPreviews] = useState<string[]>(
    (initial?.images ?? []).map((i) => i.url)
  );
  const [files, setFiles] = useState<File[]>([]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  }

  async function uploadFiles(): Promise<string[]> {
    if (files.length === 0) return [];
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل رفع الصور");
    return data.urls as string[];
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    try {
      const uploaded = await uploadFiles();
      const urls = [
        ...imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
        ...uploaded,
      ];
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
        discountPercentage: Number(form.discountPercentage) || 0,
        images: urls.map((url) => ({ url, alt: form.name, isMain: false, sortOrder: 0 })),
      };
      const url = editId ? `/api/products/${editId}` : "/api/products";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setOk(editId ? "تم التعديل بنجاح ✅" : "تمت الإضافة بنجاح ✅");
      setTimeout(() => router.push("/admin/products"), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <h1 className="text-xl font-black">{editId ? "تعديل منتج" : "إضافة منتج جديد"}</h1>
      {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
      {ok && <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">{ok}</div>}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">اسم المنتج *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="مثال: غرفة نوم مودرن" required />
        </div>
        <div>
          <label className="label">القسم *</label>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">التوفر</label>
          <select value={form.availability} onChange={(e) => set("availability", e.target.value as typeof form.availability)} className="input">
            <option value="IN_STOCK">متوفر</option>
            <option value="OUT_OF_STOCK">غير متوفر</option>
            <option value="PREORDER">حجز مسبق</option>
          </select>
        </div>
        <div>
          <label className="label">السعر الحالي (جنيه) *</label>
          <input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} className="input" min={0} required />
        </div>
        <div>
          <label className="label">السعر قبل الخصم (اختياري)</label>
          <input
            type="number"
            value={form.oldPrice}
            onChange={(e) => set("oldPrice", e.target.value === "" ? "" : Number(e.target.value))}
            className="input"
            min={0}
            placeholder="مثال: 35000"
          />
        </div>
        <div>
          <label className="label">نسبة الخصم %</label>
          <input type="number" value={form.discountPercentage} onChange={(e) => set("discountPercentage", Number(e.target.value))} className="input" min={0} max={90} />
        </div>
        <div>
          <label className="label">المقاسات</label>
          <input value={form.size ?? ""} onChange={(e) => set("size", e.target.value)} className="input" placeholder="160×200" />
        </div>
        <div>
          <label className="label">الألوان</label>
          <input value={form.color ?? ""} onChange={(e) => set("color", e.target.value)} className="input" placeholder="بيج / بني" />
        </div>
        <div>
          <label className="label">الخامات</label>
          <input value={form.material ?? ""} onChange={(e) => set("material", e.target.value)} className="input" placeholder="زان + قطيفة" />
        </div>
        <div className="md:col-span-2">
          <label className="label">الوصف</label>
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className="input min-h-[100px]" />
        </div>
        <div className="md:col-span-2">
          <label className="label">المواصفات</label>
          <textarea value={form.specifications ?? ""} onChange={(e) => set("specifications", e.target.value)} className="input min-h-[80px]" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["isOnSale", "عليه عرض (SALE)"],
            ["isFeatured", "مميز في الرئيسية"],
            ["isNew", "منتج جديد"],
            ["isActive", "نشط (ظاهر بالموقع)"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex cursor-pointer items-center gap-2 rounded-xl bg-sand-100 p-3 text-sm font-bold">
            <input type="checkbox" checked={Boolean(form[k])} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4" />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="label">روابط الصور (سطر لكل صورة) — الصورة الأولى هي الرئيسية</label>
        <textarea
          value={imagesText}
          onChange={(e) => {
            setImagesText(e.target.value);
            if (files.length === 0)
              setPreviews(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
          }}
          className="input min-h-[90px] text-left"
          dir="ltr"
          placeholder="https://..."
        />
        <label className="label mt-3">أو ارفع صور من جهازك</label>
        <input type="file" accept="image/*" multiple onChange={onFiles} className="input" />
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((src, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-sand-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">رئيسية</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <button disabled={loading} className="btn-primary flex-1">
          {loading ? "جارٍ الحفظ..." : editId ? "حفظ التعديلات" : "إضافة المنتج"}
        </button>
        <button type="button" onClick={() => history.back()} className="btn-ghost">
          رجوع
        </button>
      </div>
    </form>
  );
}
