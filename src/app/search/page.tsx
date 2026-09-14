import type { Metadata } from "next";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import CategoryView from "@/components/CategoryView";

export const metadata: Metadata = { title: "البحث | جولدن هوم" };
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
  const [products, categories, settings] = await Promise.all([
    getProducts(q ? { q } : { limit: 24 }),
    getCategories(true),
    getSettings(),
  ]);
  return (
    <div className="container-x py-6">
      <h1 className="text-2xl font-black">
        {q ? `نتائج البحث عن: "${q}"` : "تصفح كل المنتجات"}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {products.length} نتيجة • ابحث بالاسم أو القسم أو الخامة
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a key={c.id} href={`/search?q=${encodeURIComponent(c.name)}`} className="badge-soft hover:bg-sand-200">
            {c.name}
          </a>
        ))}
      </div>
      <div className="mt-6">
        <CategoryView products={products} whatsapp={settings.whatsapp} />
      </div>
    </div>
  );
}
