import Link from "next/link";
import type { ProductRow } from "@/lib/store";
import { availabilityLabel, cn, formatEGP } from "@/lib/utils";

export default function ProductCard({ p, whatsapp }: { p: ProductRow; whatsapp?: string }) {
  const waNumber = whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP ?? "201000000000";
  const img = p.images.find((i) => i.isMain)?.url ?? p.images[0]?.url ?? "/placeholder.svg";
  const discount = p.discountPercentage || 0;
  return (
    <article className="card group transition hover:shadow-lift">
      <Link href={`/products/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {p.isOnSale && discount > 0 && <span className="badge-sale">خصم {discount}%</span>}
          {p.isNew && <span className="badge-soft !bg-brand-700 !text-white">جديد</span>}
          {p.availability !== "IN_STOCK" && (
            <span className="badge-soft">{availabilityLabel(p.availability)}</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-bold text-brand-600">{p.category?.name ?? ""}</p>
        <Link href={`/products/${p.slug}`}>
          <h3 className="mt-1 line-clamp-1 text-[15px] font-black text-stone-800 hover:text-brand-700">
            {p.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-black text-brand-800">{formatEGP(p.price)}</span>
          {p.oldPrice && p.oldPrice > p.price && (
            <span className="text-xs font-bold text-stone-400 line-through">{formatEGP(p.oldPrice)}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/products/${p.slug}`} className="btn-primary flex-1 !py-2 !text-[13px]">
            عرض التفاصيل
          </Link>
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
              `أريد الاستفسار عن: ${p.name} — ${formatEGP(p.price)}`
            )}`}
            target="_blank"
            className="btn-ghost !px-3 !py-2 !text-[13px]"
          >
            واتساب
          </a>
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className={cn("card p-10 text-center")}>
      <p className="text-4xl">🛋️</p>
      <p className="mt-3 text-lg font-black">{title}</p>
      {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
    </div>
  );
}
