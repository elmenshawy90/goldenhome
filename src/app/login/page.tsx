"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("admin@goldenhome.eg");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تسجيل الدخول");
      router.push(sp.get("next") || "/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-md p-6 md:p-8">
      <p className="text-center text-3xl">🔐</p>
      <h1 className="mt-2 text-center text-xl font-black">دخول الإدارة</h1>
      <p className="mt-1 text-center text-xs text-stone-500">
        الحساب الافتراضي: admin@goldenhome.eg
      </p>
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>
      )}
      <div className="mt-4 space-y-3">
        <div>
          <label className="label">البريد الإلكتروني</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            dir="ltr"
            placeholder="••••••"
          />
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-10">
      <Suspense fallback={<div className="card p-8 text-sm">جارٍ التحميل...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
