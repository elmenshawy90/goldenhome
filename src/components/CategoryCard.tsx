import Link from "next/link";
import type { CategoryRow } from "@/lib/store";

const slugToHref: Record<string, string> = {
  bedrooms: "/bedrooms",
  "kids-rooms": "/kids-rooms",
  corners: "/corners",
  "living-rooms": "/living-rooms",
  mattresses: "/mattresses",
};

export default function CategoryCard({ c }: { c: CategoryRow }) {
  return (
    <Link
      href={slugToHref[c.slug] ?? `/search?q=${encodeURIComponent(c.name)}`}
      className="card group relative block overflow-hidden"
    >
      <div className="aspect-[16/10] overflow-hidden bg-sand-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.coverImage || "/placeholder.svg"}
          alt={c.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
        <p className="text-lg font-black text-white">{c.name}</p>
        {c.description && <p className="line-clamp-1 text-xs text-white/80">{c.description}</p>}
      </div>
    </Link>
  );
}
