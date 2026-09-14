import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requireAdmin, requirePermission } from "@/lib/guard";
import { staffRoleSchema } from "@/lib/validations";
import { normalizePermissions } from "@/lib/permissions";
import { getStaffRoles } from "@/lib/data";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const roles = await getStaffRoles();
  return NextResponse.json({ roles });
}

export async function POST(req: NextRequest) {
  if (!(await requirePermission("staff"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const parsed = staffRoleSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
  const name = parsed.data.name.trim().toLowerCase();
  const data = {
    name,
    label: parsed.data.label.trim(),
    permissions: normalizePermissions(parsed.data.permissions),
  };

  if (dbEnabled()) {
    try {
      const created = await prisma.staffRole.create({ data });
      return NextResponse.json({ role: created }, { status: 201 });
    } catch {
      return NextResponse.json({ error: "اسم الدور مكرر" }, { status: 409 });
    }
  }
  const db = readDb();
  if (db.roles.some((r) => r.name === name))
    return NextResponse.json({ error: "اسم الدور مكرر" }, { status: 409 });
  const now = new Date().toISOString();
  const role = { id: `role-${Date.now()}`, ...data, isSystem: false, createdAt: now, updatedAt: now };
  db.roles.push(role);
  writeDb(db);
  return NextResponse.json({ role }, { status: 201 });
}
