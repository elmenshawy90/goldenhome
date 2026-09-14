import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { productSchema } from "@/lib/validations";
import { calcDiscount } from "@/lib/utils";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (dbEnabled()) {
    try {
      const p = await prisma.product.findFirst({
        where: { OR: [{ id: params.id }, { slug: params.id }] },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      });
      if (p) return NextResponse.json({ product: p });
    } catch {}
  }
  const db = readDb();
  const p = db.products.find((x) => x.id === params.id || x.slug === params.id);
  if (!p) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ product: p });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("products"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  const discount = d.discountPercentage || calcDiscount(d.price, d.oldPrice ?? undefined);

  if (dbEnabled()) {
    try {
      const updated = await prisma.product.update({
        where: { id: params.id },
        data: {
          name: d.name,
          ...(d.slug ? { slug: d.slug } : {}),
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
            deleteMany: {},
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
      return NextResponse.json({ product: updated });
    } catch {}
  }
  const db = readDb();
  const idx = db.products.findIndex((x) => x.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  const prev = db.products[idx];
  db.products[idx] = {
    ...prev,
    name: d.name,
    slug: d.slug || prev.slug,
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
    updatedAt: new Date().toISOString(),
    images: (d.images ?? []).map((im, i) => ({
      id: `${prev.id}-img-${i}-${Date.now()}`,
      productId: prev.id,
      url: im.url,
      alt: im.alt || d.name,
      isMain: i === 0,
      sortOrder: i,
    })),
  };
  writeDb(db);
  return NextResponse.json({ product: db.products[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("products"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (dbEnabled()) {
    try {
      await prisma.product.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true });
    } catch {}
  }
  const db = readDb();
  const before = db.products.length;
  db.products = db.products.filter((x) => x.id !== params.id);
  if (db.products.length === before) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  writeDb(db);
  return NextResponse.json({ ok: true });
}
