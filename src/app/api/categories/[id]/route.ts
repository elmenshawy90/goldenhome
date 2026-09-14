import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { categorySchema } from "@/lib/validations";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("categories"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  if (dbEnabled()) {
    try {
      const updated = await prisma.category.update({
        where: { id: params.id },
        data: {
          name: d.name,
          ...(d.slug ? { slug: d.slug } : {}),
          description: d.description || null,
          coverImage: d.coverImage || null,
          sortOrder: d.sortOrder ?? 0,
          isActive: d.isActive ?? true,
        },
      });
      return NextResponse.json({ category: updated });
    } catch {}
  }
  const db = readDb();
  const idx = db.categories.findIndex((c) => c.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  db.categories[idx] = {
    ...db.categories[idx],
    name: d.name,
    slug: d.slug || db.categories[idx].slug,
    description: d.description || null,
    coverImage: d.coverImage || null,
    sortOrder: d.sortOrder ?? 0,
    isActive: d.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return NextResponse.json({ category: db.categories[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("categories"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (dbEnabled()) {
    try {
      const count = await prisma.product.count({ where: { categoryId: params.id } });
      if (count > 0) return NextResponse.json({ error: `لا يمكن الحذف — يوجد ${count} منتج في هذا القسم` }, { status: 400 });
      await prisma.category.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "تعذر الحذف" }, { status: 400 });
    }
  }
  const db = readDb();
  if (db.products.some((p) => p.categoryId === params.id))
    return NextResponse.json({ error: "لا يمكن الحذف — يوجد منتجات في هذا القسم" }, { status: 400 });
  db.categories = db.categories.filter((c) => c.id !== params.id);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
