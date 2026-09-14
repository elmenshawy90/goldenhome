import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { offerSchema } from "@/lib/validations";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET() {
  if (dbEnabled()) {
    try {
      const rows = await prisma.offer.findMany({
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ offers: rows });
    } catch {}
  }
  const db = readDb();
  return NextResponse.json({ offers: db.offers });
}

export async function POST(req: NextRequest) {
  if (!(await requirePermission("offers"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  const payload = {
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
  };
  if (dbEnabled()) {
    try {
      const created = await prisma.offer.create({ data: payload });
      return NextResponse.json({ offer: created }, { status: 201 });
    } catch {}
  }
  const db = readDb();
  const now = new Date().toISOString();
  const offer = {
    id: `off-${Date.now()}`,
    title: payload.title,
    description: payload.description,
    discountPercentage: payload.discountPercentage,
    oldPrice: payload.oldPrice,
    newPrice: payload.newPrice,
    productId: payload.productId,
    image: payload.image,
    startsAt: payload.startsAt ? payload.startsAt.toISOString() : null,
    endsAt: payload.endsAt ? payload.endsAt.toISOString() : null,
    isActive: payload.isActive,
    createdAt: now,
    updatedAt: now,
  };
  db.offers.unshift(offer);
  writeDb(db);
  return NextResponse.json({ offer }, { status: 201 });
}
