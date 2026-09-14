import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/guard";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    if (files.length === 0) return NextResponse.json({ error: "لا توجد ملفات" }, { status: 400 });
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    const urls: string[] = [];
    for (const f of files.slice(0, 8)) {
      const buf = Buffer.from(await f.arrayBuffer());
      if (buf.length > 5 * 1024 * 1024) continue;
      const ext = (f.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      fs.writeFileSync(path.join(dir, name), buf);
      urls.push(`/uploads/${name}`);
    }
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "فشل الرفع" }, { status: 500 });
  }
}
