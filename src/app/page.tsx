import Link from "next/link";
import { getCategories, getOffers, getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { formatEGP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, newest, onSale, offers] = await Promise.all([
    getCategories(true),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getProducts({ onSale: true, limit: 8 }),
    getOffers(true),
  ]);

  const bedroomOffer = onSale.find((p) => p.category?.slug === "bedrooms");
  const mattresses = await getProducts({ categorySlug: "mattresses", limit: 4 });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80&auto=format&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-brand-900 via-brand-900/80 to-brand-900/30" />
        <div className="container-x relative grid gap-8 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge-sale !bg-amber-400 !text-brand-900">خصومات حتى 30% — لفترة محدودة</span>
            <h1 className="mt-4 text-4xl font-black leading-[1.3] md:text-5xl">
              أثاث يليق ببيتك…
              <br />
              <span className="text-amber-300">جودة دمياط بلمسة مودرن</span>
            </h1>
            <p className="mt-4 max-w-lg leading-8 text-sand-200">
              غرف نوم، غرف أطفال، ركن، انتريهات ومراتب طبية — تشطيب فاخر، ضمان حقيقي،
              وتوصيل وتركيب حتى باب البيت.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/offers" className="btn-primary !bg-amber-400 !text-brand-900 hover:!bg-amber-300">
                تسوق العروض
              </Link>
              <Link href="/bedrooms" className="btn-ghost !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
                غرف النوم
              </Link>
            </div>
            <div className="mt-8 flex gap-6 text-center">
              {[
                ["+500", "منتج"],
                ["5", "أقسام"],
                ["10", "سنوات ضمان"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-amber-300">{n}</p>
                  <p className="text-xs text-sand-200">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-brand-600">تسوق حسب القسم</p>
            <h2 className="text-2xl font-black">أقسام المنتجات</h2>
          </div>
          <Link href="/offers" className="text-sm font-bold text-brand-700 hover:underline">
            عرض كل العروض ←
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c) => (
            <CategoryCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-x mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-black">المنتجات المميزة ⭐</h2>
          <Link href="/search" className="text-sm font-bold text-brand-700 hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* BEDROOM OFFER BANNER */}
      {bedroomOffer && (
        <section className="container-x mt-12">
          <div className="card grid overflow-hidden md:grid-cols-2">
            <div className="p-8 md:p-10">
              <span className="badge-sale">عرض غرف النوم — خصم {bedroomOffer.discountPercentage}%</span>
              <h3 className="mt-3 text-2xl font-black md:text-3xl">{bedroomOffer.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-600">{bedroomOffer.description}</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand-800">{formatEGP(bedroomOffer.price)}</span>
                {bedroomOffer.oldPrice && (
                  <span className="text-sm text-stone-400 line-through">{formatEGP(bedroomOffer.oldPrice)}</span>
                )}
              </div>
              <div className="mt-5 flex gap-3">
                <Link href={`/products/${bedroomOffer.slug}`} className="btn-primary">
                  اطلب الآن
                </Link>
                <Link href="/bedrooms" className="btn-ghost">
                  كل غرف النوم
                </Link>
              </div>
            </div>
            <div className="min-h-[260px] bg-sand-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bedroomOffer.images[0]?.url}
                alt={bedroomOffer.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ON SALE */}
      <section className="container-x mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-black">العروض الحالية 🔥</h2>
          <Link href="/offers" className="text-sm font-bold text-brand-700 hover:underline">
            صفحة العروض
          </Link>
        </div>
        {onSale.length === 0 ? (
          <div className="card p-8 text-center text-sm text-stone-500">لا توجد عروض حاليًا — تابعنا قريبًا.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {onSale.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* MATTRESSES */}
      <section className="mt-12 bg-sand-100 py-10">
        <div className="container-x">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-brand-600">نوم صحي ومريح</p>
              <h2 className="text-2xl font-black">قسم المراتب</h2>
            </div>
            <Link href="/mattresses" className="text-sm font-bold text-brand-700 hover:underline">
              كل المراتب ←
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mattresses.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWEST */}
      <section className="container-x mt-12">
        <h2 className="mb-4 text-2xl font-black">أحدث المنتجات 🆕</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x mt-12">
        <div className="card bg-brand-800 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-black md:text-3xl">محتار تختار إيه لبيتك؟</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-sand-200">
            كلمنا واتساب أو تليفون، وهنرشح لك أفضل غرفة أو مرتبة حسب مقاس أوضتك وميزانيتك — مجانًا.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? "201000000000"}?text=${encodeURIComponent("أريد استشارة مجانية لاختيار الأثاث")}`}
              target="_blank"
              className="btn-primary !bg-amber-400 !text-brand-900"
            >
              استشارة واتساب
            </a>
            <Link href="/contact" className="btn-ghost !border-white/30 !bg-transparent !text-white">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
