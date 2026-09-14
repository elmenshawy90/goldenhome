import Link from "next/link";
import { getSettings } from "@/lib/data";

export default async function Footer() {
  const s = await getSettings().catch(() => null);
  const phone = s?.phone || "01000000000";
  const whatsapp = s?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || "201000000000";
  const address = s?.address || "القاهرة — شارع الأثاث، دمياط الجديدة";
  const workingHours = s?.workingHours || "يوميًا من 11ص إلى 11م";
  const about = s?.about || "متجر أثاث مصري متخصص في غرف النوم، غرف الأطفال، الركن، الانتريهات والمراتب الطبية. جودة تستحقها بيتك.";
  return (
    <footer className="mt-16 bg-brand-900 text-sand-100">
      <div className="container-x grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p dir="ltr" className="text-left text-2xl font-black tracking-tight text-white">Golden Home</p>
          <p className="mt-2 text-sm leading-7 text-sand-200">
            {about}
          </p>
          {(s?.facebook || s?.instagram || s?.tiktok) && (
            <div className="mt-3 flex gap-2">
              {s?.facebook && <a href={s.facebook} target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">فيسبوك</a>}
              {s?.instagram && <a href={s.instagram} target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">انستجرام</a>}
              {s?.tiktok && <a href={s.tiktok} target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">تيك توك</a>}
            </div>
          )}
        </div>
        <div>
          <p className="mb-3 font-black text-white">أقسام المتجر</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/bedrooms" className="hover:text-white">غرف النوم</Link></li>
            <li><Link href="/kids-rooms" className="hover:text-white">غرف الأطفال</Link></li>
            <li><Link href="/corners" className="hover:text-white">الركن</Link></li>
            <li><Link href="/living-rooms" className="hover:text-white">الانتريهات</Link></li>
            <li><Link href="/mattresses" className="hover:text-white">المراتب</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-black text-white">روابط سريعة</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/offers" className="hover:text-white">العروض</Link></li>
            <li><Link href="/search" className="hover:text-white">البحث</Link></li>
            <li><Link href="/contact" className="hover:text-white">تواصل معنا</Link></li>
            <li><Link href="/login" className="hover:text-white">دخول الإدارة</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-black text-white">تواصل معنا</p>
          <ul className="space-y-2 text-sm text-sand-200">
            <li>{address}</li>
            <li>هاتف: <span dir="ltr">{phone}</span></li>
            <li>واتساب: <span dir="ltr">{whatsapp}</span></li>
            <li>{workingHours}</li>
          </ul>
          <Link href="/contact" className="btn-primary mt-4 !bg-white !text-brand-900">
            اطلب استشارة مجانية
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-4 text-xs text-sand-300 sm:flex-row">
          <p>© {new Date().getFullYear()} Golden Home — جميع الحقوق محفوظة</p>
          <p>صنع بحب في مصر</p>
        </div>
      </div>
    </footer>
  );
}
