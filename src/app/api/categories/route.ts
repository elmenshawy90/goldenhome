import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { categorySchema } from "@/lib/validations";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET() {
  if (dbEnabled()) {
    try {
      const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
      return NextResponse.json({ categories: rows });
    } catch {}
  }
  const db = readDb();
  return NextResponse.json({ categories: db.categories });
}

export async function POST(req: NextRequest) {
  if (!(await requirePermission("categories"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  const slug = d.slug?.trim() || d.name.trim().replace(/\s+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);

  if (dbEnabled()) {
    try {
      const created = await prisma.category.create({
        data: {
          name: d.name,
          slug,
          description: d.description || null,
          coverImage: d.coverImage || null,
          sortOrder: d.sortOrder ?? 0,
          isActive: d.isActive ?? true,
        },
      });
      return NextResponse.json({ category: created }, { status: 201 });
    } catch {
      return NextResponse.json({ error: "الاسم/الرابط مكرر" }, { status: 409 });
    }
  }
  const db = readDb();
  const now = new Date().toISOString();
  const cat = {
    id: `cat-${Date.now()}`,
    name: d.name,
    slug,
    description: d.description || null,
    coverImage: d.coverImage || null,
    sortOrder: d.sortOrder ?? 0,
    isActive: d.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  db.categories.push(cat);
  writeDb(db);
  return NextResponse.json({ category: cat }, { status: 201 });
}
