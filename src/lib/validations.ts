import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "اسم القسم قصير جدًا"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  coverImage: z.string().url("رابط الصورة غير صالح").or(z.literal("")).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const productImageSchema = z.object({
  url: z.string().min(1, "رابط الصورة مطلوب"),
  alt: z.string().optional(),
  isMain: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج قصير جدًا"),
  slug: z.string().min(2).optional(),
  categoryId: z.string().min(1, "القسم مطلوب"),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0, "السعر غير صالح"),
  oldPrice: z.coerce.number().int().min(0).optional().nullable(),
  discountPercentage: z.coerce.number().int().min(0).max(90).default(0),
  isOnSale: z.coerce.boolean().default(false),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  specifications: z.string().optional(),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER"]).default("IN_STOCK"),
  isFeatured: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  images: z.array(productImageSchema).default([]),
});

export const offerSchema = z.object({
  title: z.string().min(2, "عنوان العرض مطلوب"),
  description: z.string().optional(),
  discountPercentage: z.coerce.number().int().min(0).max(90).optional().nullable(),
  oldPrice: z.coerce.number().int().min(0).optional().nullable(),
  newPrice: z.coerce.number().int().min(0).optional().nullable(),
  productId: z.string().optional().nullable(),
  image: z.string().url("رابط الصورة غير صالح").or(z.literal("")).optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور قصيرة"),
});

export const branchSchema = z.object({
  name: z.string().min(2, "اسم الفرع مطلوب"),
  address: z.string().min(2, "عنوان الفرع مطلوب"),
  phone: z.string().optional(),
});

export const settingsSchema = z.object({
  phone: z.string().min(5, "رقم الهاتف مطلوب"),
  whatsapp: z.string().min(5, "رقم الواتساب مطلوب"),
  address: z.string().min(2, "العنوان مطلوب"),
  workingHours: z.string().optional().default(""),
  topStrip: z.string().optional().default(""),
  facebook: z.string().url("رابط فيسبوك غير صالح").or(z.literal("")).optional().nullable(),
  instagram: z.string().url("رابط انستجرام غير صالح").or(z.literal("")).optional().nullable(),
  tiktok: z.string().url("رابط تيك توك غير صالح").or(z.literal("")).optional().nullable(),
  about: z.string().optional().nullable(),
  branches: z.array(branchSchema).default([]),
});

export const staffRoleSchema = z.object({
  name: z.string().min(2, "اسم الدور مطلوب (English, بدون مسافات)").regex(/^[a-z0-9_-]+$/, "استخدم حروف إنجليزية صغيرة بدون مسافات"),
  label: z.string().min(2, "الاسم المعروض مطلوب"),
  permissions: z.array(z.string()).default([]),
});

export const staffUserSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").optional(),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
  staffRoleId: z.string().optional().nullable(),
});
