import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("gh_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || "goldenhome-dev-secret-please-change-32"
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/login";
  const authed = await isAuthed(req);

  if (isAdminPage && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (isLogin && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
