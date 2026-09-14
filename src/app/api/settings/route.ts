import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";
import { requirePermission } from "@/lib/guard";
import { settingsSchema } from "@/lib/validations";
import { getSettings } from "@/lib/data";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requirePermission("settings"))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    const d = parsed.data;
    const data = {
      phone: d.phone.trim(),
      whatsapp: d.whatsapp.trim().replace(/^\+/, ""),
      address: d.address.trim(),
      workingHours: d.workingHours?.trim() || "",
      topStrip: d.topStrip?.trim() || "",
      facebook: d.facebook?.trim() || null,
      instagram: d.instagram?.trim() || null,
      tiktok: d.tiktok?.trim() || null,
      about: d.about?.trim() || null,
      branches: (d.branches ?? []).map((b) => ({
        name: b.name.trim(),
        address: b.address.trim(),
        phone: b.phone?.trim() || "",
      })),
    };

    if (dbEnabled()) {
      try {
        const saved = await prisma.siteSettings.upsert({
          where: { id: "site" },
          update: data,
          create: { id: "site", ...data },
        });
        return NextResponse.json({ settings: saved });
      } catch (e) {
        console.error("settings PUT prisma failed, falling back to file", e);
      }
    }
    try {
      const db = readDb();
      db.settings = { ...db.settings, ...data, id: "site", updatedAt: new Date().toISOString() };
      writeDb(db);
      return NextResponse.json({ settings: db.settings });
    } catch (e) {
      console.error("settings PUT file fallback failed (read-only FS on Vercel?)", e);
      return NextResponse.json({ error: "تعذر حفظ الإعدادات — قاعدة البيانات غير متاحة" }, { status: 500 });
    }
  } catch (e) {
    console.error("settings PUT failed", e);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
