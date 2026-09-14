// Central permission catalog for staff roles.
// ADMIN system role always has every permission.

export const PERMISSIONS = [
  { key: "dashboard", label: "لوحة القيادة" },
  { key: "products", label: "المنتجات" },
  { key: "categories", label: "الأقسام" },
  { key: "offers", label: "العروض" },
  { key: "settings", label: "بيانات التواصل" },
  { key: "staff", label: "الموظفون والأدوار" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERMISSIONS: string[] = PERMISSIONS.map((p) => p.key);

// Legacy STAFF users without a custom role get these:
export const DEFAULT_STAFF_PERMISSIONS: string[] = ["dashboard", "products", "categories", "offers"];

export function normalizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const valid = new Set(ALL_PERMISSIONS);
  return [...new Set(input.filter((p): p is string => typeof p === "string" && valid.has(p)))];
}
