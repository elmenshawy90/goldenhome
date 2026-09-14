import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { staffRoleSchema } from "@/lib/validations";
import { normalizePermissions } from "@/lib/permissions";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  // name is immutable (used as key); only label + permissions editable
  const parsed = staffRoleSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (parsed.data.label) data["label"] = parsed.data.label.trim();
  if (parsed.data.permissions) data["permissions"] = normalizePermissions(parsed.data.permissions);

  if (dbEnabled()) {
    try {
      const updated = await prisma.staffRole.update({ where: { id: params.id }, data });
      return NextResponse.json({ role: updated });
    } catch {
      return NextResponse.json({ error: "الدور غير موجود" }, { status: 404 });
    }
  }
  const db = readDb();
  const idx = db.roles.findIndex((r) => r.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "الدور غير موجود" }, { status: 404 });
  db.roles[idx] = { ...db.roles[idx], ...data, updatedAt: new Date().toISOString() } as (typeof db.roles)[number];
  writeDb(db);
  return NextResponse.json({ role: db.roles[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  if (dbEnabled()) {
    try {
      const existing = await prisma.staffRole.findUnique({
        where: { id: params.id },
        include: { _count: { select: { users: true } } },
      });
      if (!existing) return NextResponse.json({ error: "الدور غير موجود" }, { status: 404 });
      if (existing.isSystem) return NextResponse.json({ error: "لا يمكن حذف دور نظام" }, { status: 400 });
      if (existing._count.users > 0)
        return NextResponse.json({ error: "الدور مستخدم من موظفين — انقلهم أولًا" }, { status: 400 });
      await prisma.staffRole.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "فشل الحذف" }, { status: 400 });
    }
  }
  const db = readDb();
  const idx = db.roles.findIndex((r) => r.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "الدور غير موجود" }, { status: 404 });
  if (db.roles[idx].isSystem) return NextResponse.json({ error: "لا يمكن حذف دور نظام" }, { status: 400 });
  if (db.users.some((u) => u.staffRoleId === params.id))
    return NextResponse.json({ error: "الدور مستخدم من موظفين — انقلهم أولًا" }, { status: 400 });
  db.roles.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
