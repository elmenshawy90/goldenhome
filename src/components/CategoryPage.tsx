import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts, getSettings } from "@/lib/data";
import CategoryView from "@/components/CategoryView";

export const dynamic = "force-dynamic";

async function CategoryPage({ slug, title }: { slug: string; title: string }) {
  const [cat, products, settings] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({ categorySlug: slug }),
    getSettings(),
  ]);
  if (!cat) return notFound();
  return (
    <div className="container-x py-6">
      {/* Cover */}
      <div className="card relative overflow-hidden">
        <div className="h-48 md:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cat.coverImage || ""} alt={cat.name} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 p-5 text-white md:p-7">
          <h1 className="text-2xl font-black md:text-3xl">{cat.name}</h1>
          {cat.description && <p className="mt-1 max-w-2xl text-sm text-white/85">{cat.description}</p>}
          <p className="mt-2 text-xs text-white/70">{products.length} منتج</p>
        </div>
      </div>
      <div className="mt-6">
        <CategoryView products={products} whatsapp={settings.whatsapp} />
      </div>
    </div>
  );
}

export function makeMetadata(slug: string, title: string, desc: string): Metadata {
  return {
    title: `${title} | جولدن هوم`,
    description: desc,
    openGraph: { title: `${title} | جولدن هوم`, description: desc, type: "website" },
  };
}

export default CategoryPage;
