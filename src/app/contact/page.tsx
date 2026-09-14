import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "تواصل معنا | جولدن هوم" };

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getSettings();
  const wa = s.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || "201000000000";
  return (
    <div className="container-x py-6">
      <h1 className="text-2xl font-black md:text-3xl">تواصل معنا</h1>
      <p className="mt-1 text-sm text-stone-500">هنرد عليك في أسرع وقت — {s.workingHours}.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-lg font-black">📞 تليفون</p>
          <p className="mt-2 text-xl font-black text-brand-700" dir="ltr">{s.phone}</p>
          <p className="mt-1 text-xs text-stone-500">اتصال أو واتساب</p>
        </div>
        <div className="card p-6">
          <p className="text-lg font-black">💬 واتساب</p>
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent("أريد الاستفسار عن منتجاتكم")}`}
            target="_blank"
            className="btn-primary mt-3"
          >
            ابدأ المحادثة
          </a>
        </div>
        <div className="card p-6">
          <p className="text-lg font-black">📍 العنوان</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-7">{s.address}</p>
        </div>
      </div>
      {(s.branches?.length ?? 0) > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-black">🏪 فروعنا</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {s.branches.map((b, i) => (
              <div key={i} className="card p-5">
                <p className="font-black text-brand-800">{b.name}</p>
                <p className="mt-1 text-sm leading-7 text-stone-600">{b.address}</p>
                {b.phone && <p className="mt-1 text-sm font-bold text-brand-700" dir="ltr">{b.phone}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card mt-4 p-6">
        <p className="font-black">اطلب معاينة مجانية</p>
        <p className="mt-1 text-sm text-stone-500">ابعت لنا مقاس أوضتك على واتساب وهنرشح لك أنسب غرفة ومرتبة لميزانيتك.</p>
      </div>
    </div>
  );
}
