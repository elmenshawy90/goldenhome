"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SettingsRow } from "@/lib/store";

type Branch = { name: string; address: string; phone: string };

export default function SettingsManager({ initial }: { initial: SettingsRow }) {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: initial.phone,
    whatsapp: initial.whatsapp,
    address: initial.address,
    workingHours: initial.workingHours,
    topStrip: initial.topStrip,
    facebook: initial.facebook ?? "",
    instagram: initial.instagram ?? "",
    tiktok: initial.tiktok ?? "",
    about: initial.about ?? "",
  });
  const [branches, setBranches] = useState<Branch[]>(
    (initial.branches ?? []).map((b) => ({ name: b.name, address: b.address, phone: b.phone ?? "" }))
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function addBranch() {
    setBranches((b) => [...b, { name: "", address: "", phone: "" }]);
  }
  function updateBranch(i: number, k: keyof Branch, v: string) {
    setBranches((list) => list.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));
  }
  function removeBranch(i: number) {
    setBranches((list) => list.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, branches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setMsg("تم الحفظ ✅");
      router.refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-black">بيانات التواصل والفروع</h1>
      <p className="mt-1 text-sm text-stone-500">تظهر هذه البيانات في صفحة «تواصل معنا» والترويسة والتذييل.</p>
      {msg && <div className="card mt-3 p-3 text-sm font-bold">{msg}</div>}
      <form onSubmit={submit} className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card h-fit space-y-3 p-4">
          <p className="font-black">📞 أرقام التواصل</p>
          <div>
            <label className="label">الهاتف *</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" dir="ltr" required />
          </div>
          <div>
            <label className="label">واتساب * (بدون +)</label>
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="input" dir="ltr" required />
          </div>
          <div>
            <label className="label">العنوان الرئيسي *</label>
            <textarea value={form.address} onChange={(e) => set("address", e.target.value)} className="input" rows={2} required />
          </div>
          <div>
            <label className="label">مواعيد العمل</label>
            <input value={form.workingHours} onChange={(e) => set("workingHours", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">الشريط العلوي (Top strip)</label>
            <input value={form.topStrip} onChange={(e) => set("topStrip", e.target.value)} className="input" />
          </div>
        </div>

        <div className="card h-fit space-y-3 p-4">
          <p className="font-black">🌐 السوشيال ونبذة</p>
          <div>
            <label className="label">فيسبوك</label>
            <input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className="input text-left" dir="ltr" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="label">انستجرام</label>
            <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="input text-left" dir="ltr" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="label">تيك توك</label>
            <input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} className="input text-left" dir="ltr" placeholder="https://tiktok.com/..." />
          </div>
          <div>
            <label className="label">نبذة عن المتجر</label>
            <textarea value={form.about} onChange={(e) => set("about", e.target.value)} className="input" rows={3} />
          </div>
        </div>

        <div className="card h-fit p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-black">🏪 الفروع ({branches.length})</p>
            <button type="button" onClick={addBranch} className="btn-ghost !px-3 !py-1.5 text-xs">
              + إضافة فرع
            </button>
          </div>
          {branches.length === 0 && <p className="mt-2 text-sm text-stone-500">لا توجد فروع بعد — أضف فرعك الأول.</p>}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {branches.map((b, i) => (
              <div key={i} className="rounded-xl border border-sand-200 p-3">
                <div>
                  <label className="label">اسم الفرع *</label>
                  <input value={b.name} onChange={(e) => updateBranch(i, "name", e.target.value)} className="input" required />
                </div>
                <div className="mt-2">
                  <label className="label">عنوان الفرع *</label>
                  <input value={b.address} onChange={(e) => updateBranch(i, "address", e.target.value)} className="input" required />
                </div>
                <div className="mt-2">
                  <label className="label">هاتف الفرع</label>
                  <input value={b.phone} onChange={(e) => updateBranch(i, "phone", e.target.value)} className="input" dir="ltr" />
                </div>
                <button type="button" onClick={() => removeBranch(i)} className="mt-2 rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  حذف الفرع
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <button disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? "جارٍ الحفظ..." : "حفظ البيانات"}
          </button>
        </div>
      </form>
    </div>
  );
}
