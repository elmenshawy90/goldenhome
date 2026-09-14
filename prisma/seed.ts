import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCategories, seedProducts } from "../src/data/seed";
import { calcDiscount } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding GoldenHome...");

  for (const c of seedCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, coverImage: c.coverImage, sortOrder: c.sortOrder, isActive: true },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        coverImage: c.coverImage,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });
  }

  for (const p of seedProducts) {
    const cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!cat) continue;
    const discount = p.oldPrice ? calcDiscount(p.price, p.oldPrice) : 0;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
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
        availability: p.availability as "IN_STOCK",
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isActive: true,
        images: {
          create: p.images.map((url, i) => ({ url, alt: p.name, isMain: i === 0, sortOrder: i })),
        },
      },
    });
  }

  await prisma.siteSettings.upsert({    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      phone: "01000000000",
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "201000000000",
      address: "القاهرة — شارع الأثاث، دمياط الجديدة",
      workingHours: "يوميًا من 11ص إلى 11م",
      topStrip: "توصيل وتركيب مجاني داخل القاهرة • ضمان حتى 10 سنوات",
      branches: [],
    },
  });

  const systemRoles = [
    { name: "admin", label: "مدير عام", permissions: ["dashboard", "products", "categories", "offers", "settings", "staff"] },
    { name: "staff", label: "موظف", permissions: ["dashboard", "products", "categories", "offers"] },
    { name: "viewer", label: "مشاهد", permissions: ["dashboard"] },
  ];
  for (const r of systemRoles) {
    await prisma.staffRole.upsert({
      where: { name: r.name },
      update: { label: r.label, permissions: r.permissions },
      create: { name: r.name, label: r.label, permissions: r.permissions, isSystem: true },
    });
  }

  const email = (process.env.ADMIN_EMAIL || "admin@goldenhome.eg").toLowerCase();  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || "مدير المتجر",
        email,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 10),
        role: "ADMIN",
      },
    });
    console.log(`👤 Admin created: ${email}`);
  }

  console.log("✅ Done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
