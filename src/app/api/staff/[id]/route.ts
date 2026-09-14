import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { verifyToken } from "@/lib/auth";
import { staffUserSchema } from "@/lib/validations";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

async function selfId(): Promise<string | null> {
  const token = cookies().get("gh_token")?.value;
  if (!token) return null;
  const u = await verifyToken(token);
  return u?.id ?? null;
}

const publicUser = (u: Record<string, unknown>) => {
  const { password: _p, ...rest } = u;
  return rest;
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = staffUserSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.name) data["name"] = d.name.trim();
  if (d.email) data["email"] = d.email.toLowerCase().trim();
  if (d.role) data["role"] = d.role;
  if (d.staffRoleId !== undefined) data["staffRoleId"] = d.staffRoleId || null;
  if (d.password) data["password"] = await bcrypt.hash(d.password, 10);

  if (dbEnabled()) {
    try {
      if (data["staffRoleId"]) {
        const r = await prisma.staffRole.findUnique({ where: { id: data["staffRoleId"] as string } });
        if (!r) return NextResponse.json({ error: "الدور غير موجود" }, { status: 400 });
      }
      // Prevent removing the last ADMIN
      if (data["role"] === "STAFF") {
        const target = await prisma.user.findUnique({ where: { id: params.id } });
        if (target?.role === "ADMIN") {
          const admins = await prisma.user.count({ where: { role: "ADMIN" } });
          if (admins <= 1) return NextResponse.json({ error: "لا يمكن تنزيل آخر مدير عام" }, { status: 400 });
        }
      }
      const updated = await prisma.user.update({
        where: { id: params.id },
        data,
        include: { staffRole: true },
      });
      return NextResponse.json({ user: publicUser(updated as unknown as Record<string, unknown>) });
    } catch {
      return NextResponse.json({ error: "المستخدم غير موجود أو البريد مكرر" }, { status: 404 });
    }
  }
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  if (data["email"] && db.users.some((u, i) => i !== idx && u.email.toLowerCase() === String(data["email"]).toLowerCase()))
    return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقًا" }, { status: 409 });
  if (data["staffRoleId"] && !db.roles.some((r) => r.id === data["staffRoleId"]))
    return NextResponse.json({ error: "الدور غير موجود" }, { status: 400 });
  db.users[idx] = { ...db.users[idx], ...data } as (typeof db.users)[number];
  writeDb(db);
  return NextResponse.json({ user: publicUser(db.users[idx] as unknown as Record<string, unknown>) });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const me = await selfId();
  if (me === params.id) return NextResponse.json({ error: "لا يمكنك حذف حسابك" }, { status: 400 });

  if (dbEnabled()) {
    try {
      const target = await prisma.user.findUnique({ where: { id: params.id } });
      if (!target) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      if (target.role === "ADMIN") {
        const admins = await prisma.user.count({ where: { role: "ADMIN" } });
        if (admins <= 1) return NextResponse.json({ error: "لا يمكن حذف آخر مدير عام" }, { status: 400 });
      }
      await prisma.user.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "فشل الحذف" }, { status: 400 });
    }
  }
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  db.users.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
