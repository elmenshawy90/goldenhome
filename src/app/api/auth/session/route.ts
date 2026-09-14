import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const s = await getSession().catch(() => null);
  return NextResponse.json({ user: s });
}
