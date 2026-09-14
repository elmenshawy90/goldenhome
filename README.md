# جولدن هوم — GoldenHome Furniture Store

متجر أثاث عربي كامل (RTL) — Next.js 14 + TypeScript + Tailwind + Prisma + PostgreSQL.

## التشغيل السريع (بدون قاعدة بيانات)

```bash
npm install
npm run dev
# افتح http://localhost:3000
```

الموقع يعمل فورًا ببيانات تجريبية (ملف `data/db.json` يُنشأ تلقائيًا من `src/data/seed.ts`)،
ولوحة التحكم تعمل كاملة (إضافة/تعديل/حذف) بدون PostgreSQL.

**دخول الإدارة:** `admin@goldenhome.eg` — كلمة المرور من `.env` (الافتراضية `Admin123!`)

## التشغيل مع PostgreSQL المحلي (بدون Docker)

1. ثبّت PostgreSQL 17 على ويندوز (إن لم يكن موجودًا) وتأكد أن الخدمة `postgresql-x64-17` تعمل على `5432`.
2. كمسؤول (Run as Administrator):
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\fix-postgres-admin.ps1"
# ينشئ المستخدم goldenhome / كلمة goldenhome123 / قاعدة goldenhome
```
3. ثم:
```bash
npm run db:setup            # generate + push + seed
npm run dev
```

## أهم المسارات

| المسار | الوصف |
|---|---|
| `/` | الرئيسية (Hero + أقسام + مميز + عروض + مراتب) |
| `/bedrooms` `/kids-rooms` `/corners` `/living-rooms` `/mattresses` | صفحات الأقسام مع فلاتر |
| `/products/[slug]` | تفاصيل المنتج + صور + مشابه |
| `/offers` `/search` `/contact` | العروض / البحث / التواصل |
| `/login` | دخول الإدارة |
| `/admin` | لوحة القيادة + المنتجات + الأقسام + العروض |

## API

- `GET/POST /api/products` — `GET/PUT/DELETE /api/products/[id]`
- `GET/POST /api/categories` — `PUT/DELETE /api/categories/[id]`
- `GET/POST /api/offers` — `PUT/DELETE /api/offers/[id]`
- `POST /api/auth/login` — `GET/POST /api/auth/session`
- `POST /api/upload` — رفع صور إلى `public/uploads`

## البنية

```
prisma/schema.prisma      # Users, Categories, Products, ProductImages, Offers
src/lib/prisma.ts         # Prisma client
src/lib/store.ts          # File-DB fallback (data/db.json)
src/lib/data.ts           # طبقة البيانات (Prisma أو ملف)
src/lib/auth.ts           # JWT cookie auth
src/data/seed.ts          # بيانات تجريبية
src/app/...               # صفحات المتجر + /admin + /api
```

## التطوير مستقبلًا

البنية جاهزة لإضافة: سلة (Cart) + طلبات (Orders) + عملاء (Customers) + دفع —
أضف موديلات `Cart/Order/Customer` في `schema.prisma` واربطها بـ `Product/User`.
