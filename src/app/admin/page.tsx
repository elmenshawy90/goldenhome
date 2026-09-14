import Link from "next/link";
import { getStats, getProducts } from "@/lib/data";
import { formatEGP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const stats = await getStats();
  const latest = await getProducts({ limit: 5 });
  const cards = [
    ["إجمالي المنتجات", stats.products, "🛋️"],
    ["الأقسام", stats.categories, "📁"],
    ["منتجات عليها عروض", stats.onSale, "🔥"],
    ["متوفر", stats.inStock, "✅"],
    ["غير متوفر / حجز", stats.outStock, "⏳"],
    ["عروض نشطة", stats.offers, "🎁"],
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">لوحة القيادة</h1>
        <Link href="/admin/products/new" className="btn-primary !py-2 text-sm">
          + إضافة منتج
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, icon]) => (
          <div key={label as string} className="card p-5">
            <p className="text-2xl">{icon}</p>
            <p className="mt-2 text-3xl font-black text-brand-900">{value}</p>
            <p className="text-sm font-bold text-stone-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="card mt-5 p-5">
        <p className="font-black">أحدث المنتجات</p>
        <div className="mt-3 divide-y divide-sand-100">
          {latest.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="font-bold">{p.name}</span>
              <span className="flex items-center gap-3">
                <span className="font-black text-brand-700">{formatEGP(p.price)}</span>
                <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-bold text-brand-600 hover:underline">
                  تعديل
                </Link>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
