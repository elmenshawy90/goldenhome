"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow } from "@/lib/store";

export default function CategoriesManager({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState({ name: "", description: "", coverImage: "", sortOrder: 0, isActive: true });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function startEdit(c: CategoryRow) {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description ?? "",
      coverImage: c.coverImage ?? "",
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    });
  }
  function reset() {
    setEditing(null);
    setForm({ name: "", description: "", coverImage: "", sortOrder: 0, isActive: true });
  }

  async function refresh() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setList(data.categories);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setMsg(editing ? "تم التعديل ✅" : "تمت الإضافة ✅");
      reset();
      await refresh();
      router.refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`حذف القسم "${name}"؟`)) return;
    setMsg("");
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "فشل الحذف");
      return;
    }
    setMsg("تم الحذف ✅");
    await refresh();
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-black">إدارة الأقسام ({list.length})</h1>
      {msg && <div className="card mt-3 p-3 text-sm font-bold">{msg}</div>}
      <div className="mt-3 grid gap-4 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="card h-fit p-4">
          <p className="font-black">{editing ? "تعديل قسم" : "إضافة قسم جديد"}</p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="label">اسم القسم *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">رابط صورة الغلاف</label>
              <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="input text-left" dir="ltr" />
            </div>
            <div>
              <label className="label">الترتيب</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input" />
            </div>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
              نشط
            </label>
            <div className="flex gap-2">
              <button disabled={loading} className="btn-primary flex-1 !py-2 text-sm">
                {loading ? "..." : editing ? "حفظ" : "إضافة"}
              </button>
              {editing && (
                <button type="button" onClick={reset} className="btn-ghost !py-2 text-sm">
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="grid h-fit gap-3 sm:grid-cols-2">
          {list.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              {c.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.coverImage} alt={c.name} className="h-28 w-full object-cover" />
              )}
              <div className="p-3">
                <p className="font-black">{c.name} <span className="text-xs text-stone-400">/{c.slug}</span></p>
                <p className="line-clamp-1 text-xs text-stone-500">{c.description}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => startEdit(c)} className="rounded-lg bg-sand-100 px-3 py-1 text-xs font-bold">تعديل</button>
                  <button onClick={() => remove(c.id, c.name)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
