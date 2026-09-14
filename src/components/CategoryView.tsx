"use client";

import { useMemo, useState } from "react";
import ProductCard, { EmptyState } from "@/components/ProductCard";
import type { ProductRow } from "@/lib/store";

export default function CategoryView({ products }: { products: ProductRow[] }) {
  const [q, setQ] = useState("");
  const [onlySale, setOnlySale] = useState(false);
  const [avail, setAvail] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("new");

  const colors = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => {
      (p.color ?? "").split("/").forEach((c) => {
        const t = c.trim();
        if (t) s.add(t);
      });
    });
    return Array.from(s).slice(0, 12);
  }, [products]);

  const list = useMemo(() => {
    let l = [...products];
    if (q.trim()) l = l.filter((p) => p.name.includes(q.trim()) || (p.description ?? "").includes(q.trim()));
    if (onlySale) l = l.filter((p) => p.isOnSale);
    if (avail) l = l.filter((p) => p.availability === avail);
    if (maxPrice !== "") l = l.filter((p) => p.price <= Number(maxPrice));
    if (color) l = l.filter((p) => (p.color ?? "").includes(color));
    if (sort === "cheap") l.sort((a, b) => a.price - b.price);
    else if (sort === "exp") l.sort((a, b) => b.price - a.price);
    else if (sort === "sale") l.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    return l;
  }, [products, q, onlySale, avail, maxPrice, color, sort]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="card h-fit p-4 lg:sticky lg:top-32">
        <p className="font-black">فلترة النتائج</p>
        <div className="mt-3 space-y-3">
          <div>
            <label className="label">بحث داخل القسم</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="مثال: مودرن" className="input" />
          </div>
          <div>
            <label className="label">السعر حتى (جنيه)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="مثال: 20000"
              className="input"
            />
          </div>
          <div>
            <label className="label">التوفر</label>
            <select value={avail} onChange={(e) => setAvail(e.target.value)} className="input">
              <option value="">الكل</option>
              <option value="IN_STOCK">متوفر</option>
              <option value="PREORDER">حجز مسبق</option>
              <option value="OUT_OF_STOCK">غير متوفر</option>
            </select>
          </div>
          <div>
            <label className="label">اللون</label>
            <select value={color} onChange={(e) => setColor(e.target.value)} className="input">
              <option value="">كل الألوان</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الترتيب</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input">
              <option value="new">الأحدث</option>
              <option value="cheap">الأرخص أولًا</option>
              <option value="exp">الأغلى أولًا</option>
              <option value="sale">أكبر خصم</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
            <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} className="h-4 w-4" />
            العروض فقط 🔥
          </label>
          <p className="text-xs text-stone-500">عدد النتائج: {list.length}</p>
        </div>
      </aside>

      {/* Grid */}
      <div>
        {list.length === 0 ? (
          <EmptyState title="لا توجد منتجات مطابقة" hint="جرّب تغيير الفلاتر أو البحث بكلمة مختلفة" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
