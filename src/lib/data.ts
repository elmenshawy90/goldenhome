import { prisma } from "@/lib/prisma";
import { readDb, writeDb, withCategory, defaultSettings, defaultRoles, type CategoryRow, type OfferRow, type ProductRow, type SettingsRow, type StaffRoleRow } from "@/lib/store";
import { calcDiscount } from "@/lib/utils";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

// ---------- Categories ----------
export async function getCategories(activeOnly = false): Promise<CategoryRow[]> {
  if (dbEnabled()) {
    try {
      const rows = await prisma.category.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });
      return rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        coverImage: c.coverImage,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    } catch {}
  }
  const db = readDb();
  const list = [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  return activeOnly ? list.filter((c) => c.isActive) : list;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

// ---------- Products ----------
export type ProductFilter = {
  q?: string;
  categorySlug?: string;
  categoryId?: string;
  onSale?: boolean;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
};

function filterFileProducts(products: ProductRow[], f: ProductFilter): ProductRow[] {
  let list = products.filter((p) => p.isActive);
  if (f.categorySlug) list = list.filter((p) => p.category?.slug === f.categorySlug);
  if (f.categoryId) list = list.filter((p) => p.categoryId === f.categoryId);
  if (f.onSale) list = list.filter((p) => p.isOnSale);
  if (f.featured) list = list.filter((p) => p.isFeatured);
  if (f.isNew) list = list.filter((p) => p.isNew);
  if (f.availability) list = list.filter((p) => p.availability === f.availability);
  if (f.minPrice != null) list = list.filter((p) => p.price >= f.minPrice!);
  if (f.maxPrice != null) list = list.filter((p) => p.price <= f.maxPrice!);
  if (f.q) {
    const q = f.q.trim();
    list = list.filter(
      (p) =>
        p.name.includes(q) ||
        (p.description ?? "").includes(q) ||
        (p.category?.name ?? "").includes(q) ||
        (p.color ?? "").includes(q) ||
        (p.material ?? "").includes(q)
    );
  }
  list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (f.limit) list = list.slice(0, f.limit);
  return list;
}

export async function getProducts(f: ProductFilter = {}): Promise<ProductRow[]> {
  if (dbEnabled()) {
    try {
      const where: Record<string, unknown> = { isActive: true };
      if (f.categorySlug) where["category"] = { slug: f.categorySlug };
      if (f.categoryId) (where as Record<string, unknown>)["categoryId"] = f.categoryId;
      if (f.onSale) (where as Record<string, unknown>)["isOnSale"] = true;
      if (f.featured) (where as Record<string, unknown>)["isFeatured"] = true;
      if (f.isNew) (where as Record<string, unknown>)["isNew"] = true;
      if (f.availability) (where as Record<string, unknown>)["availability"] = f.availability;
      if (f.minPrice != null || f.maxPrice != null) {
        (where as Record<string, unknown>)["price"] = {
          ...(f.minPrice != null ? { gte: f.minPrice } : {}),
          ...(f.maxPrice != null ? { lte: f.maxPrice } : {}),
        };
      }
      if (f.q) {
        (where as Record<string, unknown>)["OR"] = [
          { name: { contains: f.q, mode: "insensitive" } },
          { description: { contains: f.q, mode: "insensitive" } },
          { color: { contains: f.q, mode: "insensitive" } },
        ];
      }
      const rows = await prisma.product.findMany({
        where: where as Record<string, unknown>,
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
        orderBy: { createdAt: "desc" },
        take: f.limit,
      });
      return rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        discountPercentage: p.discountPercentage ?? calcDiscount(p.price, p.oldPrice),
        isOnSale: p.isOnSale,
        size: p.size,
        color: p.color,
        material: p.material,
        specifications: p.specifications,
        availability: p.availability as ProductRow["availability"],
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isActive: p.isActive,
        views: p.views,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        images: p.images.map((im) => ({
          id: im.id,
          productId: im.productId,
          url: im.url,
          alt: im.alt,
          isMain: im.isMain,
          sortOrder: im.sortOrder,
        })),
        category: p.category
          ? {
              id: p.category.id,
              name: p.category.name,
              slug: p.category.slug,
              description: p.category.description,
              coverImage: p.category.coverImage,
              sortOrder: p.category.sortOrder,
              isActive: p.category.isActive,
              createdAt: p.category.createdAt.toISOString(),
              updatedAt: p.category.updatedAt.toISOString(),
            }
          : null,
      }));
    } catch {}
  }
  const db = readDb();
  const enriched = db.products.map((p) => withCategory(db, p));
  return filterFileProducts(enriched, f);
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  if (dbEnabled()) {
    try {
      const p = await prisma.product.findUnique({
        where: { slug },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      });
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        discountPercentage: p.discountPercentage ?? calcDiscount(p.price, p.oldPrice),
        isOnSale: p.isOnSale,
        size: p.size,
        color: p.color,
        material: p.material,
        specifications: p.specifications,
        availability: p.availability as ProductRow["availability"],
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isActive: p.isActive,
        views: p.views,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        images: p.images.map((im) => ({
          id: im.id,
          productId: im.productId,
          url: im.url,
          alt: im.alt,
          isMain: im.isMain,
          sortOrder: im.sortOrder,
        })),
        category: p.category
          ? {
              id: p.category.id,
              name: p.category.name,
              slug: p.category.slug,
              description: p.category.description,
              coverImage: p.category.coverImage,
              sortOrder: p.category.sortOrder,
              isActive: p.category.isActive,
              createdAt: p.category.createdAt.toISOString(),
              updatedAt: p.category.updatedAt.toISOString(),
            }
          : null,
      };
    } catch {}
  }
  const db = readDb();
  const p = db.products.find((x) => x.slug === slug || x.id === slug);
  return p ? withCategory(db, p) : null;
}

export async function getRelated(product: ProductRow, limit = 4): Promise<ProductRow[]> {
  const all = await getProducts({ categoryId: product.categoryId });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}

// ---------- Offers ----------
export async function getOffers(activeOnly = true): Promise<OfferRow[]> {
  if (dbEnabled()) {
    try {
      const now = new Date();
      const rows = await prisma.offer.findMany({
        include: {
          product: { include: { images: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      let list: OfferRow[] = rows.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        discountPercentage: o.discountPercentage,
        oldPrice: o.oldPrice,
        newPrice: o.newPrice,
        productId: o.productId,
        image: o.image,
        startsAt: o.startsAt?.toISOString() ?? null,
        endsAt: o.endsAt?.toISOString() ?? null,
        isActive: o.isActive,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        product: null,
      }));
      if (activeOnly) {
        list = list.filter((o) => {
          if (!o.isActive) return false;
          if (o.startsAt && new Date(o.startsAt) > now) return false;
          if (o.endsAt && new Date(o.endsAt) < now) return false;
          return true;
        });
      }
      return list;
    } catch {}
  }
  const db = readDb();
  const now = new Date();
  let list = [...db.offers];
  if (activeOnly) {
    list = list.filter((o) => {
      if (!o.isActive) return false;
      if (o.startsAt && new Date(o.startsAt) > now) return false;
      if (o.endsAt && new Date(o.endsAt) < now) return false;
      return true;
    });
  }
  return list.map((o) => ({
    ...o,
    product: o.productId ? withCategory(db, db.products.find((p) => p.id === o.productId)!) ?? null : null,
  }));
}

export async function getStats() {
  const [cats, prods, offers] = await Promise.all([getCategories(), getProducts(), getOffers(false)]);
  const onSale = prods.filter((p) => p.isOnSale).length;
  const inStock = prods.filter((p) => p.availability === "IN_STOCK").length;
  const outStock = prods.filter((p) => p.availability !== "IN_STOCK").length;
  return {
    products: prods.length,
    categories: cats.length,
    onSale,
    inStock,
    outStock,
    offers: offers.filter((o) => o.isActive).length,
  };
}

export function fileDb() {
  const db = readDb();
  return { db, write: () => writeDb(db) };
}

// ---------- Staff roles ----------
export type StaffUserPublic = {
  id: string;
  name: string;
  email: string;
  role: string;
  staffRoleId: string | null;
  staffRole: StaffRoleRow | null;
  createdAt: string;
};

export async function getStaffRoles(): Promise<StaffRoleRow[]> {
  if (dbEnabled()) {
    try {
      const rows = await prisma.staffRole.findMany({ orderBy: { createdAt: "asc" } });
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        label: r.label,
        permissions: Array.isArray(r.permissions) ? (r.permissions as string[]) : [],
        isSystem: r.isSystem,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch {}
  }
  try {
    return readDb().roles ?? defaultRoles();
  } catch {}
  return defaultRoles();
}

export async function getStaffUsers(): Promise<StaffUserPublic[]> {
  if (dbEnabled()) {
    try {
      const rows = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        include: { staffRole: true },
      });
      return rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        staffRoleId: u.staffRoleId,
        staffRole: u.staffRole
          ? {
              id: u.staffRole.id,
              name: u.staffRole.name,
              label: u.staffRole.label,
              permissions: Array.isArray(u.staffRole.permissions) ? (u.staffRole.permissions as string[]) : [],
              isSystem: u.staffRole.isSystem,
              createdAt: u.staffRole.createdAt.toISOString(),
              updatedAt: u.staffRole.updatedAt.toISOString(),
            }
          : null,
        createdAt: u.createdAt.toISOString(),
      }));
    } catch {}
  }
  const db = readDb();
  return db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    staffRoleId: u.staffRoleId ?? null,
    staffRole: db.roles.find((r) => r.id === u.staffRoleId) ?? null,
    createdAt: "",
  }));
}

// ---------- Site settings (contact details, branches, socials) ----------
export async function getSettings(): Promise<SettingsRow> {
  if (dbEnabled()) {
    try {
      const s = await prisma.siteSettings.findUnique({ where: { id: "site" } });
      if (s) {
        return {
          id: s.id,
          phone: s.phone,
          whatsapp: s.whatsapp,
          address: s.address,
          workingHours: s.workingHours,
          topStrip: s.topStrip,
          facebook: s.facebook,
          instagram: s.instagram,
          tiktok: s.tiktok,
          about: s.about,
          branches: (s.branches as SettingsRow["branches"]) ?? [],
          updatedAt: s.updatedAt.toISOString(),
        };
      }
    } catch {}
  }
  try {
    return readDb().settings ?? defaultSettings();
  } catch {}
  return defaultSettings();
}
