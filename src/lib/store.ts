import fs from "node:fs";
import path from "node:path";
import { seedCategories, seedProducts } from "@/data/seed";
import { calcDiscount } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductImageRow = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  discountPercentage: number;
  isOnSale: boolean;
  size: string | null;
  color: string | null;
  material: string | null;
  specifications: string | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImageRow[];
  category?: CategoryRow | null;
};

export type OfferRow = {
  id: string;
  title: string;
  description: string | null;
  discountPercentage: number | null;
  oldPrice: number | null;
  newPrice: number | null;
  productId: string | null;
  image: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: ProductRow | null;
};

export type BranchRow = {
  name: string;
  address: string;
  phone?: string;
};

export type SettingsRow = {
  id: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  topStrip: string;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  about: string | null;
  branches: BranchRow[];
  updatedAt: string;
};

export type StaffRoleRow = {
  id: string;
  name: string;
  label: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StaffUserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  staffRoleId: string | null;
};

type DbShape = {
  categories: CategoryRow[];
  products: ProductRow[];
  offers: OfferRow[];
  users: StaffUserRow[];
  settings: SettingsRow;
  roles: StaffRoleRow[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export function defaultSettings(): SettingsRow {
  const now = new Date().toISOString();
  return {
    id: "site",
    phone: "01000000000",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "201000000000",
    address: "القاهرة — شارع الأثاث، دمياط الجديدة",
    workingHours: "يوميًا من 11ص إلى 11م",
    topStrip: "توصيل وتركيب مجاني داخل القاهرة • ضمان حتى 10 سنوات",
    facebook: null,
    instagram: null,
    tiktok: null,
    about: null,
    branches: [],
    updatedAt: now,
  };
}

export function defaultRoles(): StaffRoleRow[] {
  const now = new Date().toISOString();
  return [
    { id: "role-admin", name: "admin", label: "مدير عام", permissions: ["dashboard", "products", "categories", "offers", "settings", "staff"], isSystem: true, createdAt: now, updatedAt: now },
    { id: "role-staff", name: "staff", label: "موظف", permissions: ["dashboard", "products", "categories", "offers"], isSystem: true, createdAt: now, updatedAt: now },
    { id: "role-viewer", name: "viewer", label: "مشاهد", permissions: ["dashboard"], isSystem: true, createdAt: now, updatedAt: now },
  ];
}

function buildSeed(): DbShape {
  const now = new Date().toISOString();
  const categories: CategoryRow[] = seedCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.coverImage,
    sortOrder: c.sortOrder,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));
  const products: ProductRow[] = seedProducts.map((p, i) => {
    const cat = categories.find((c) => c.slug === p.categorySlug)!;
    const discount = p.oldPrice ? calcDiscount(p.price, p.oldPrice) : 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: cat.id,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      discountPercentage: discount,
      isOnSale: p.isOnSale,
      size: p.size,
      color: p.color,
      material: p.material,
      specifications: p.specifications,
      availability: p.availability,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isActive: true,
      views: 10 + i,
      createdAt: now,
      updatedAt: now,
      images: p.images.map((url, idx) => ({
        id: `${p.id}-img-${idx}`,
        productId: p.id,
        url,
        alt: p.name,
        isMain: idx === 0,
        sortOrder: idx,
      })),
      category: cat,
    };
  });
  return { categories, products, offers: [], users: [], settings: defaultSettings(), roles: defaultRoles() };
}

export function readDb(): DbShape {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw) as DbShape;
      if (parsed.categories && parsed.products) {
        if (!parsed.settings) parsed.settings = defaultSettings();
        if (!parsed.roles) parsed.roles = defaultRoles();
        parsed.users = (parsed.users ?? []).map((u) => ({
          ...u,
          staffRoleId: (u as StaffUserRow).staffRoleId ?? null,
        }));
        return parsed;
      }
    }
  } catch {}
  const seed = buildSeed();
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
  } catch {}
  return seed;
}

export function writeDb(db: DbShape) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function withCategory(db: DbShape, p: ProductRow): ProductRow {
  return { ...p, category: db.categories.find((c) => c.id === p.categoryId) ?? null };
}
