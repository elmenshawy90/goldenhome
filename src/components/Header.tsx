"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/bedrooms", label: "غرف النوم" },
  { href: "/kids-rooms", label: "غرف الأطفال" },
  { href: "/corners", label: "الركن" },
  { href: "/living-rooms", label: "الانتريهات" },
  { href: "/mattresses", label: "المراتب" },
  { href: "/offers", label: "العروض" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header({ loggedIn, topStrip, phone }: { loggedIn: boolean; topStrip?: string | null; phone?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/90 backdrop-blur">
      {/* top strip */}
      <div className="bg-brand-900 text-white">
        <div className="container-x flex items-center justify-between py-1.5 text-[12px]">
          <p>{topStrip || "توصيل وتركيب مجاني داخل القاهرة • ضمان حتى 10 سنوات"}</p>
          <p className="hidden sm:block">اتصل بنا: <span dir="ltr">{phone || "01000000000"}</span></p>
        </div>
      </div>

      <div className="container-x flex items-center gap-3 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-xl font-black text-white">
            G
          </span>
          <span className="leading-tight">
            <span dir="ltr" className="block text-xl font-black leading-none tracking-tight text-brand-900 md:text-2xl">Golden Home</span>
            <span className="mt-1 block text-[11px] font-bold text-stone-500">أثاث • مراتب • ديكور</span>
          </span>
        </Link>

        <form
          className="mx-auto hidden max-w-xl flex-1 items-center gap-2 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن غرفة نوم، ركنة، مرتبة..."
            className="input"
          />
          <button className="btn-primary !px-4 !py-2.5" type="submit">
            بحث
          </button>
        </form>

        <div className="ms-auto flex items-center gap-2">
          {loggedIn ? (
            <Link href="/admin" className="btn-ghost !px-4 !py-2">
              لوحة التحكم
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost !px-4 !py-2">
              تسجيل الدخول
            </Link>
          )}
          <Link href="/offers" className="btn-primary hidden !px-4 !py-2 sm:inline-flex">
            عروض اليوم
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-sand-300 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            ☰
          </button>
        </div>
      </div>

      {/* desktop nav */}
      <nav className="hidden border-t border-sand-100 bg-white md:block">
        <div className="container-x flex items-center gap-1 overflow-x-auto py-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition ${
                pathname === l.href
                  ? "bg-brand-700 text-white"
                  : "text-stone-700 hover:bg-sand-100 hover:text-brand-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* mobile nav */}
      {open && (
        <nav className="border-t border-sand-200 bg-white p-3 md:hidden">
          <form
            className="mb-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث..."
              className="input"
            />
            <button className="btn-primary !px-4" type="submit">
              بحث
            </button>
          </form>
          <div className="grid gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-bold ${
                  pathname === l.href ? "bg-brand-700 text-white" : "bg-sand-50 text-stone-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
