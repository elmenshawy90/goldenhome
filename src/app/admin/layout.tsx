import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserPermissions } from "@/lib/guard";
import LogoutButton from "./LogoutButton";

const nav = [
  { href: "/admin", label: "📊 لوحة القيادة", perm: "dashboard", exact: true },
  { href: "/admin/products", label: "🛋️ المنتجات", perm: "products" },
  { href: "/admin/categories", label: "📁 الأقسام", perm: "categories" },
  { href: "/admin/offers", label: "🔥 العروض", perm: "offers" },
  { href: "/admin/settings", label: "📞 بيانات التواصل", perm: "settings" },
  { href: "/admin/staff", label: "👥 الموظفون", perm: "staff" },
  { href: "/", label: "🏠 عرض الموقع", perm: null },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login?next=/admin");
  const perms = await getUserPermissions(session.id, session.role).catch(() => [] as string[]);
  const visible = nav.filter((n) => n.perm === null || perms.includes(n.perm));

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="border-b border-sand-200 bg-white">
        <div className="container-x flex items-center justify-between py-3">
          <Link href="/admin" className="font-black text-brand-900">
            🛠️ لوحة تحكم جولدن هوم
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-stone-500">{session.name} • {session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="container-x grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-3 lg:sticky lg:top-24">
          <nav className="grid gap-1">
            {visible.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-stone-700 hover:bg-sand-100"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
