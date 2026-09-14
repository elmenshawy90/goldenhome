"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow, ProductRow } from "@/lib/store";
import { formatEGP } from "@/lib/utils";

export default function ProductsTable({
  products,
  categories,
}: {
  products: (ProductRow & { category?: CategoryRow | null })[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const list = useMemo(() => {
    let l = [...products];
    if (q.trim()) l = l.filter((p) => p.name.includes(q.trim()));
    if (cat) l = l.filter((p) => p.categoryId === cat);
    return l;
  }, [products, q, cat]);

  async function remove(id: string, name: string) {
    if (!confirm(`هل أنت متأكد أنك تريد حذف هذا المنتج؟\n${name}`)) return;
    setDeleting(id);
    setMsg("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحذف");
      setMsg("تم حذف المنتج بنجاح ✅");
      router.refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطأ");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-black">المنتجات ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary !py-2 text-sm">
          + إضافة منتج
        </Link>
      </div>
      {msg && <div className="card mt-3 bg-green-50 p-3 text-sm font-bold text-green-800">{msg}</div>}
      <div className="card mt-3 flex flex-col gap-2 p-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث باسم المنتج..." className="input" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input sm:max-w-[220px]">
          <option value="">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="card mt-3 overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-sand-100 text-right text-xs text-stone-500">
              <th className="p-3">المنتج</th>
              <th className="p-3">القسم</th>
              <th className="p-3">السعر</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {list.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <span className="font-bold">{p.name}</span>
                  {p.isOnSale && <span className="badge-sale mr-2">SALE</span>}
                </td>
                <td className="p-3">{p.category?.name ?? "—"}</td>
                <td className="p-3 font-black">{formatEGP(p.price)}</td>
                <td className="p-3">{p.availability === "IN_STOCK" ? "متوفر" : p.availability}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-bold hover:bg-sand-200">
                      تعديل
                    </Link>
                    <button
                      disabled={deleting === p.id}
                      onClick={() => remove(p.id, p.name)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleting === p.id ? "..." : "حذف"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center text-sm text-stone-500">لا توجد منتجات مطابقة.</p>}
      </div>
    </div>
  );
}
