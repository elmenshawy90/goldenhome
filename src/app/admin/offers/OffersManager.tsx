"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OfferRow, ProductRow } from "@/lib/store";

export default function OffersManager({ initial, products }: { initial: OfferRow[]; products: ProductRow[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<OfferRow | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercentage: "",
    oldPrice: "",
    newPrice: "",
    productId: "",
    image: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(o: OfferRow) {
    setEditing(o);
    setForm({
      title: o.title,
      description: o.description ?? "",
      discountPercentage: o.discountPercentage?.toString() ?? "",
      oldPrice: o.oldPrice?.toString() ?? "",
      newPrice: o.newPrice?.toString() ?? "",
      productId: o.productId ?? "",
      image: o.image ?? "",
      startsAt: o.startsAt ? o.startsAt.slice(0, 16) : "",
      endsAt: o.endsAt ? o.endsAt.slice(0, 16) : "",
      isActive: o.isActive,
    });
  }
  function reset() {
    setEditing(null);
    setForm({
      title: "", description: "", discountPercentage: "", oldPrice: "", newPrice: "",
      productId: "", image: "", startsAt: "", endsAt: "", isActive: true,
    });
  }

  async function refresh() {
    const res = await fetch("/api/offers");
    const data = await res.json();
    setList(data.offers);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        discountPercentage: form.discountPercentage === "" ? null : Number(form.discountPercentage),
        oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
        newPrice: form.newPrice === "" ? null : Number(form.newPrice),
        productId: form.productId || null,
        image: form.image || undefined,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        isActive: form.isActive,
      };
      const url = editing ? `/api/offers/${editing.id}` : "/api/offers";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setMsg("تم الحفظ ✅");
      reset();
      await refresh();
      router.refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا العرض؟")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    await refresh();
    router.refresh();
  }

  async function toggle(o: OfferRow) {
    await fetch(`/api/offers/${o.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: o.title,
        description: o.description ?? undefined,
        discountPercentage: o.discountPercentage,
        oldPrice: o.oldPrice,
        newPrice: o.newPrice,
        productId: o.productId,
        image: o.image ?? undefined,
        startsAt: o.startsAt,
        endsAt: o.endsAt,
        isActive: !o.isActive,
      }),
    });
    await refresh();
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-black">إدارة العروض ({list.length})</h1>
      {msg && <div className="card mt-3 p-3 text-sm font-bold">{msg}</div>}
      <div className="mt-3 grid gap-4 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-3 p-4">
          <p className="font-black">{editing ? "تعديل عرض" : "إضافة عرض"}</p>
          <div>
            <label className="label">عنوان العرض *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">الوصف</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">خصم %</label>
              <input type="number" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">قبل</label>
              <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">بعد</label>
              <input type="number" value={form.newPrice} onChange={(e) => setForm({ ...form, newPrice: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">المنتج المرتبط (اختياري)</label>
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="input">
              <option value="">— بدون منتج —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">رابط الصورة</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input text-left" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">من</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">إلى</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
            مفعّل
          </label>
          <div className="flex gap-2">
            <button disabled={loading} className="btn-primary flex-1 !py-2 text-sm">
              {loading ? "..." : editing ? "حفظ" : "إضافة"}
            </button>
            {editing && (
              <button type="button" onClick={reset} className="btn-ghost !py-2 text-sm">إلغاء</button>
            )}
          </div>
        </form>
        <div className="grid h-fit gap-3">
          {list.map((o) => (
            <div key={o.id} className="card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-black">
                  {o.title}{" "}
                  <span className={`text-xs ${o.isActive ? "text-green-600" : "text-stone-400"}`}>
                    {o.isActive ? "● نشط" : "○ متوقف"}
                  </span>
                </p>
                <p className="text-xs text-stone-500">
                  {o.discountPercentage != null ? `خصم ${o.discountPercentage}% • ` : ""}
                  {o.startsAt ? `من ${o.startsAt.slice(0, 10)} ` : ""}
                  {o.endsAt ? `إلى ${o.endsAt.slice(0, 10)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => toggle(o)} className="rounded-lg bg-sand-100 px-3 py-1 text-xs font-bold">
                  {o.isActive ? "إيقاف" : "تفعيل"}
                </button>
                <button onClick={() => startEdit(o)} className="rounded-lg bg-sand-100 px-3 py-1 text-xs font-bold">تعديل</button>
                <button onClick={() => remove(o.id)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">حذف</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="card p-6 text-center text-sm text-stone-500">لا توجد عروض بعد.</div>}
        </div>
      </div>
    </div>
  );
}
