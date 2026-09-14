import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb, withCategory } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { productSchema } from "@/lib/validations";
import { calcDiscount, slugify } from "@/lib/utils";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const onSale = searchParams.get("onSale") === "1";
  const featured = searchParams.get("featured") === "1";

  if (dbEnabled()) {
    try {
      const rows = await prisma.product.findMany({
        where: {
          ...(categorySlug ? { category: { slug: categorySlug } } : {}),
          ...(onSale ? { isOnSale: true } : {}),
          ...(featured ? { isFeatured: true } : {}),
          ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ products: rows });
    } catch (e) {
      // fallback below
    }
  }
  const db = readDb();
  let list = db.products.map((p) => withCategory(db, p));
  if (categorySlug) list = list.filter((p) => p.category?.slug === categorySlug);
  if (onSale) list = list.filter((p) => p.isOnSale);
  if (featured) list = list.filter((p) => p.isFeatured);
  if (q) list = list.filter((p) => p.name.includes(q) || (p.description ?? "").includes(q));
  return NextResponse.json({ products: list });
}

export async function POST(req: NextRequest) {
  if (!(await requirePermission("products"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    const d = parsed.data;
    const discount =
      d.discountPercentage || calcDiscount(d.price, d.oldPrice ?? undefined);
    const slug = d.slug?.trim() || slugify(d.name);

    if (dbEnabled()) {
      try {
        const created = await prisma.product.create({
          data: {
            name: d.name,
            slug,
            categoryId: d.categoryId,
            description: d.description || null,
            price: d.price,
            oldPrice: d.oldPrice ?? null,
            discountPercentage: discount,
            isOnSale: d.isOnSale || discount > 0,
            size: d.size || null,
            color: d.color || null,
            material: d.material || null,
            specifications: d.specifications || null,
            availability: d.availability as "IN_STOCK",
            isFeatured: d.isFeatured,
            isNew: d.isNew,
            isActive: d.isActive,
            images: {
              create: (d.images ?? []).map((im, i) => ({
                url: im.url,
                alt: im.alt || d.name,
                isMain: i === 0,
                sortOrder: i,
              })),
            },
          },
          include: { images: true, category: true },
        });
        return NextResponse.json({ product: created }, { status: 201 });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("Unique") || msg.includes("slug"))
          return NextResponse.json({ error: "اسم/رابط المنتج مكرر" }, { status: 409 });
        // fallback to file
      }
    }
    const db = readDb();
    if (!db.categories.some((c) => c.id === d.categoryId))
      return NextResponse.json({ error: "القسم غير موجود" }, { status: 400 });
    const now = new Date().toISOString();
    const id = `p-${Date.now()}`;
    const product = {
      id,
      name: d.name,
      slug,
      categoryId: d.categoryId,
      description: d.description || null,
      price: d.price,
      oldPrice: d.oldPrice ?? null,
      discountPercentage: discount,
      isOnSale: d.isOnSale || discount > 0,
      size: d.size || null,
      color: d.color || null,
      material: d.material || null,
      specifications: d.specifications || null,
      availability: d.availability,
      isFeatured: d.isFeatured,
      isNew: d.isNew,
      isActive: d.isActive,
      views: 0,
      createdAt: now,
      updatedAt: now,
      images: (d.images ?? []).map((im, i) => ({
        id: `${id}-img-${i}-${Date.now()}`,
        productId: id,
        url: im.url,
        alt: im.alt || d.name,
        isMain: i === 0,
        sortOrder: i,
      })),
    };
    db.products.unshift(product);
    writeDb(db);
    return NextResponse.json({ product: withCategory(db, product) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
