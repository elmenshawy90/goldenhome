import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelated, getSettings } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { availabilityLabel, formatEGP } from "@/lib/utils";
import Gallery from "./Gallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: "منتج غير موجود" };
  return {
    title: `${p.name} | جولدن هوم`,
    description: (p.description ?? "").slice(0, 160),
    openGraph: {
      title: p.name,
      description: (p.description ?? "").slice(0, 160),
      images: p.images[0]?.url ? [p.images[0].url] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p || !p.isActive) return notFound();
  const [related, settings] = await Promise.all([getRelated(p, 4), getSettings()]);
  const waNumber = settings.whatsapp;
  const wa = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `أريد طلب: ${p.name} — ${formatEGP(p.price)} (كود: ${p.slug})`
  )}`;

  return (
    <div className="container-x py-6">
      <nav className="mb-4 text-xs text-stone-500">
        <Link href="/" className="hover:underline">الرئيسية</Link>
        {" / "}
        <span>{p.category?.name}</span>
        {" / "}
        <span className="font-bold text-stone-700">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <Gallery images={p.images.map((i) => ({ url: i.url, alt: i.alt ?? p.name }))} name={p.name} />

        <div>
          <p className="text-sm font-bold text-brand-600">{p.category?.name}</p>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">{p.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {p.isOnSale && p.discountPercentage > 0 && (
              <span className="badge-sale">خصم {p.discountPercentage}% 🔥</span>
            )}
            {p.isNew && <span className="badge-soft !bg-brand-700 !text-white">جديد</span>}
            <span className={`badge-soft ${p.availability === "IN_STOCK" ? "!bg-green-100 !text-green-800" : ""}`}>
              {availabilityLabel(p.availability)}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-brand-800">{formatEGP(p.price)}</span>
            {p.oldPrice && p.oldPrice > p.price && (
              <span className="text-base text-stone-400 line-through">{formatEGP(p.oldPrice)}</span>
            )}
          </div>
          {p.oldPrice && p.oldPrice > p.price && (
            <p className="mt-1 text-sm font-bold text-green-700">
              وفّر {formatEGP(p.oldPrice - p.price)} من السعر الأصلي
            </p>
          )}

          {p.description && <p className="mt-4 text-sm leading-8 text-stone-600">{p.description}</p>}

          <div className="card mt-5 divide-y divide-sand-100 p-0">
            {[
              ["القسم", p.category?.name],
              ["المقاسات", p.size],
              ["الألوان المتاحة", p.color],
              ["الخامات", p.material],
            ].map(([k, v]) => (
              <div key={k as string} className="flex gap-3 px-4 py-2.5 text-sm">
                <span className="w-28 shrink-0 font-black text-stone-500">{k}</span>
                <span className="font-bold">{v || "—"}</span>
              </div>
            ))}
          </div>

          {p.specifications && (
            <div className="card mt-3 bg-sand-50 p-4 text-sm leading-7">
              <p className="font-black">التفاصيل والمواصفات</p>
              <p className="mt-1 text-stone-600">{p.specifications}</p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a href={wa} target="_blank" className="btn-primary flex-1">
              اطلب عبر واتساب
            </a>
            <Link href="/contact" className="btn-ghost flex-1">
              استفسر بالتليفون
            </Link>
          </div>
          <p className="mt-3 text-xs leading-6 text-stone-500">
            الدفع عند الاستلام أو تحويل • معاينة قبل الاستلام • ضمان مكتوب • إمكانية التفصيل حسب المقاس.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-black">منتجات مشابهة</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} whatsapp={waNumber} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
