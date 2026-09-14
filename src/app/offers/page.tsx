import Link from "next/link";
import type { Metadata } from "next";
import { getOffers, getProducts, getSettings } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { formatEGP } from "@/lib/utils";

export const metadata: Metadata = {
  title: "العروض والخصومات | جولدن هوم",
  description: "أقوى عروض الأثاث والمراتب: خصومات حقيقية على غرف النوم والركن والانتريهات.",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const [offers, sale, settings] = await Promise.all([getOffers(true), getProducts({ onSale: true, limit: 24 }), getSettings()]);
  return (
    <div className="container-x py-6">
      <h1 className="text-2xl font-black md:text-3xl">العروض الحالية 🔥</h1>
      <p className="mt-1 text-sm text-stone-500">خصومات حقيقية بأسعار قبل وبعد — لفترة محدودة.</p>

      {offers.length > 0 && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {offers.map((o) => (
            <div key={o.id} className="card flex gap-4 p-4">
              {o.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.image} alt={o.title} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
              )}
              <div>
                <p className="font-black">{o.title}</p>
                {o.description && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{o.description}</p>}
                <div className="mt-2 flex gap-2 text-sm font-black">
                  {o.newPrice != null && <span className="text-brand-700">{formatEGP(o.newPrice)}</span>}
                  {o.oldPrice != null && <span className="text-stone-400 line-through">{formatEGP(o.oldPrice)}</span>}
                  {o.discountPercentage != null && <span className="badge-sale">خصم {o.discountPercentage}%</span>}
                </div>
                {o.productId && (
                  <Link href={`/products/${o.product?.slug ?? ""}`} className="mt-2 inline-block text-xs font-bold text-brand-700 hover:underline">
                    عرض المنتج ←
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-xl font-black">منتجات عليها خصم ({sale.length})</h2>
      {sale.length === 0 ? (
        <div className="card p-8 text-center text-sm text-stone-500">لا توجد عروض حاليًا.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sale.map((p) => (
            <ProductCard key={p.id} p={p} whatsapp={settings.whatsapp} />
          ))}
        </div>
      )}
    </div>
  );
}
