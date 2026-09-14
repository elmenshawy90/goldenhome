import { NextRequest, NextResponse } from "next/server";
import { authenticate, setSessionCookie, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }
    const user = await authenticate(parsed.data.email, parsed.data.password);
    if (!user) return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    const token = await signToken(user);
    setSessionCookie(token);
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
