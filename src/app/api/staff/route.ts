import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { staffUserSchema } from "@/lib/validations";
import { getStaffUsers } from "@/lib/data";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

const publicUser = (u: Record<string, unknown>) => {
  const { password: _p, ...rest } = u;
  return rest;
};

export async function GET() {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const users = await getStaffUsers();
  return NextResponse.json({ users: users.map(publicUser) });
}

export async function POST(req: NextRequest) {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = staffUserSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const d = parsed.data;
  const password = d.password;
  if (!password)
    return NextResponse.json({ error: "كلمة المرور مطلوبة للموظف الجديد" }, { status: 400 });
  const email = d.email.toLowerCase().trim();
  const hash = await bcrypt.hash(password, 10);

  // staffRole must exist if provided
  if (dbEnabled()) {
    try {
      if (d.staffRoleId) {
        const r = await prisma.staffRole.findUnique({ where: { id: d.staffRoleId } });
        if (!r) return NextResponse.json({ error: "الدور غير موجود" }, { status: 400 });
      }
      const created = await prisma.user.create({
        data: {
          name: d.name.trim(),
          email,
          password: hash,
          role: d.role as "ADMIN" | "STAFF",
          staffRoleId: d.staffRoleId || null,
        },
        include: { staffRole: true },
      });
      return NextResponse.json({ user: publicUser(created as unknown as Record<string, unknown>) }, { status: 201 });
    } catch {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقًا" }, { status: 409 });
    }
  }
  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email))
    return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقًا" }, { status: 409 });
  if (d.staffRoleId && !db.roles.some((r) => r.id === d.staffRoleId))
    return NextResponse.json({ error: "الدور غير موجود" }, { status: 400 });
  const now = new Date().toISOString();
  const user = {
    id: `user-${Date.now()}`,
    name: d.name.trim(),
    email,
    password: hash,
    role: d.role,
    staffRoleId: d.staffRoleId || null,
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(user);
  writeDb(db);
  return NextResponse.json({ user: publicUser(user as unknown as Record<string, unknown>) }, { status: 201 });
}
