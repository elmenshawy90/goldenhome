import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readDb } from "@/lib/store";
import { ALL_PERMISSIONS, DEFAULT_STAFF_PERMISSIONS, normalizePermissions } from "@/lib/permissions";

export async function requireAdmin(): Promise<boolean> {
  const token = cookies().get("gh_token")?.value;
  if (!token) return false;
  const u = await verifyToken(token);
  return Boolean(u && (u.role === "ADMIN" || u.role === "STAFF"));
}

// Fresh permissions for a user id (ADMIN => all). Reads DB each call so
// role changes apply immediately without re-login.
export async function getUserPermissions(userId: string, systemRole?: string): Promise<string[]> {
  if (systemRole === "ADMIN") return [...ALL_PERMISSIONS];
  if (process.env.DATABASE_URL) {
    try {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        include: { staffRole: true },
      });
      if (!u) return [];
      if (u.role === "ADMIN") return [...ALL_PERMISSIONS];
      if (u.staffRole) return normalizePermissions(u.staffRole.permissions);
      return [...DEFAULT_STAFF_PERMISSIONS];
    } catch {}
  }
  try {
    const db = readDb();
    const u = db.users.find((x) => x.id === userId);
    if (!u) return [];
    if (u.role === "ADMIN") return [...ALL_PERMISSIONS];
    const r = db.roles.find((x) => x.id === u.staffRoleId);
    if (r) return normalizePermissions(r.permissions);
    return [...DEFAULT_STAFF_PERMISSIONS];
  } catch {}
  return [];
}

export async function requirePermission(perm: string): Promise<boolean> {
  const token = cookies().get("gh_token")?.value;
  if (!token) return false;
  const u = await verifyToken(token);
  if (!u) return false;
  if (u.role === "ADMIN") return true;
  const perms = await getUserPermissions(u.id, u.role);
  return perms.includes(perm);
}
