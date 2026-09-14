import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { readDb, writeDb } from "@/lib/store";

const COOKIE = "gh_token";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET || "goldenhome-dev-secret-please-change-32";
  return new TextEncoder().encode(s);
}

export type SessionUser = { id: string; name: string; email: string; role: string };

export async function signToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id ?? ""),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "ADMIN"),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setSessionCookie(token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const isHttps = siteUrl.startsWith("https://");
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure فقط مع https حتى يعمل الإنتاج محليًا عبر http
    secure: process.env.NODE_ENV === "production" && isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

async function ensureSeedAdminInDb() {
  try {
    if (!process.env.DATABASE_URL) return;
    const count = await prisma.user.count();
    if (count > 0) return;
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 10);
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || "مدير المتجر",
        email: (process.env.ADMIN_EMAIL || "admin@goldenhome.eg").toLowerCase(),
        password: hash,
        role: "ADMIN",
      },
    });
  } catch {}
}

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const em = email.toLowerCase().trim();

  // 1) Try Prisma when DATABASE_URL exists
  if (process.env.DATABASE_URL) {
    await ensureSeedAdminInDb();
    try {
      const u = await prisma.user.findUnique({ where: { email: em } });
      if (u && (await bcrypt.compare(password, u.password))) {
        return { id: u.id, name: u.name, email: u.email, role: u.role };
      }
    } catch {
      // fall through to file/env fallback
    }
  }

  // 2) File DB users
  try {
    const db = readDb();
    const u = db.users.find((x) => x.email.toLowerCase() === em);
    if (u && (await bcrypt.compare(password, u.password))) {
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    }
  } catch {}

  // 3) Env fallback admin (always works for first login)
  const envEmail = (process.env.ADMIN_EMAIL || "admin@goldenhome.eg").toLowerCase();
  const envPass = process.env.ADMIN_PASSWORD || "Admin123!";
  if (em === envEmail && password === envPass) {
    // persist to file db for later
    try {
      const db = readDb();
      if (!db.users.some((x) => x.email.toLowerCase() === em)) {
        const hash = await bcrypt.hash(envPass, 10);
        db.users.push({
          id: "user-admin",
          name: process.env.ADMIN_NAME || "مدير المتجر",
          email: em,
          password: hash,
          role: "ADMIN",
          staffRoleId: null,
        });
        writeDb(db);
      }
    } catch {}
    return { id: "user-admin", name: process.env.ADMIN_NAME || "مدير المتجر", email: em, role: "ADMIN" };
  }
  return null;
}
