import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { offerSchema } from "@/lib/validations";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("offers"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  if (dbEnabled()) {
    try {
      const updated = await prisma.offer.update({
        where: { id: params.id },
        data: {
          title: d.title,
          description: d.description || null,
          discountPercentage: d.discountPercentage ?? null,
          oldPrice: d.oldPrice ?? null,
          newPrice: d.newPrice ?? null,
          productId: d.productId || null,
          image: d.image || null,
          startsAt: d.startsAt ? new Date(d.startsAt) : null,
          endsAt: d.endsAt ? new Date(d.endsAt) : null,
          isActive: d.isActive ?? true,
        },
      });
      return NextResponse.json({ offer: updated });
    } catch {}
  }
  const db = readDb();
  const idx = db.offers.findIndex((o) => o.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  db.offers[idx] = {
    ...db.offers[idx],
    title: d.title,
    description: d.description || null,
    discountPercentage: d.discountPercentage ?? null,
    oldPrice: d.oldPrice ?? null,
    newPrice: d.newPrice ?? null,
    productId: d.productId || null,
    image: d.image || null,
    startsAt: d.startsAt ? new Date(d.startsAt).toISOString() : null,
    endsAt: d.endsAt ? new Date(d.endsAt).toISOString() : null,
    isActive: d.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return NextResponse.json({ offer: db.offers[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("offers"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (dbEnabled()) {
    try {
      await prisma.offer.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true });
    } catch {}
  }
  const db = readDb();
  db.offers = db.offers.filter((o) => o.id !== params.id);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
