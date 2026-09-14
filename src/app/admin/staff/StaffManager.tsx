"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import type { StaffRoleRow } from "@/lib/store";
import type { StaffUserPublic } from "@/lib/data";

function emptyUserForm() {
  return { name: "", email: "", password: "", role: "STAFF", staffRoleId: "" };
}

export default function StaffManager({
  initialUsers,
  initialRoles,
  selfId,
}: {
  initialUsers: StaffUserPublic[];
  initialRoles: StaffRoleRow[];
  selfId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- user form ----
  const [editingUser, setEditingUser] = useState<StaffUserPublic | null>(null);
  const [uform, setUform] = useState(emptyUserForm());

  // ---- role form ----
  const [editingRole, setEditingRole] = useState<StaffRoleRow | null>(null);
  const [rform, setRform] = useState({ name: "", label: "", permissions: [] as string[] });

  async function refresh() {
    const [ur, rr] = await Promise.all([fetch("/api/staff"), fetch("/api/roles")]);
    if (ur.ok) setUsers((await ur.json()).users);
    if (rr.ok) setRoles((await rr.json()).roles);
    router.refresh();
  }

  function startEditUser(u: StaffUserPublic) {
    setEditingUser(u);
    setUform({ name: u.name, email: u.email, password: "", role: u.role, staffRoleId: u.staffRoleId ?? "" });
  }

  async function submitUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const payload: Record<string, unknown> = {
        name: uform.name,
        email: uform.email,
        role: uform.role,
        staffRoleId: uform.staffRoleId || null,
      };
      if (uform.password) payload["password"] = uform.password;
      const url = editingUser ? `/api/staff/${editingUser.id}` : "/api/staff";
      const res = await fetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setMsg(editingUser ? "تم تعديل الموظف ✅" : "تمت إضافة الموظف ✅");
      setEditingUser(null);
      setUform(emptyUserForm());
      await refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(id: string, name: string) {
    if (!confirm(`حذف الموظف "${name}"؟`)) return;
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "فشل الحذف");
      return;
    }
    setMsg("تم الحذف ✅");
    await refresh();
  }

  function startEditRole(r: StaffRoleRow) {
    setEditingRole(r);
    setRform({ name: r.name, label: r.label, permissions: [...r.permissions] });
  }

  function togglePerm(p: string) {
    setRform((f) => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p],
    }));
  }

  async function submitRole(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const payload = editingRole
        ? { label: rform.label, permissions: rform.permissions }
        : { name: rform.name, label: rform.label, permissions: rform.permissions };
      const res = await fetch(url, {
        method: editingRole ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setMsg(editingRole ? "تم تعديل الدور ✅" : "تمت إضافة الدور ✅");
      setEditingRole(null);
      setRform({ name: "", label: "", permissions: [] });
      await refresh();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function removeRole(id: string, label: string) {
    if (!confirm(`حذف الدور "${label}"؟`)) return;
    const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "فشل الحذف");
      return;
    }
    setMsg("تم الحذف ✅");
    await refresh();
  }

  const roleLabel = (u: StaffUserPublic) => u.staffRole?.label ?? (u.role === "ADMIN" ? "مدير عام" : "—");

  return (
    <div>
      <h1 className="text-xl font-black">الموظفون والأدوار</h1>
      {msg && <div className="card mt-3 p-3 text-sm font-bold">{msg}</div>}

      {/* ---- Users ---- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submitUser} className="card h-fit space-y-3 p-4">
          <p className="font-black">{editingUser ? "تعديل موظف" : "إضافة موظف"}</p>
          <div>
            <label className="label">الاسم *</label>
            <input value={uform.name} onChange={(e) => setUform({ ...uform, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">البريد الإلكتروني *</label>
            <input value={uform.email} onChange={(e) => setUform({ ...uform, email: e.target.value })} className="input text-left" dir="ltr" type="email" required />
          </div>
          <div>
            <label className="label">{editingUser ? "كلمة مرور جديدة (اتركها فارغة للإبقاء)" : "كلمة المرور *"}</label>
            <input value={uform.password} onChange={(e) => setUform({ ...uform, password: e.target.value })} className="input text-left" dir="ltr" type="password" required={!editingUser} minLength={6} />
          </div>
          <div>
            <label className="label">نوع الحساب</label>
            <select value={uform.role} onChange={(e) => setUform({ ...uform, role: e.target.value })} className="input">
              <option value="STAFF">موظف</option>
              <option value="ADMIN">مدير عام (كل الصلاحيات)</option>
            </select>
          </div>
          <div>
            <label className="label">الدور الوظيفي</label>
            <select value={uform.staffRoleId} onChange={(e) => setUform({ ...uform, staffRoleId: e.target.value })} className="input">
              <option value="">— بدون دور مخصص —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.label} ({r.permissions.length})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="btn-primary flex-1 !py-2 text-sm">
              {loading ? "..." : editingUser ? "حفظ" : "إضافة"}
            </button>
            {editingUser && (
              <button type="button" onClick={() => { setEditingUser(null); setUform(emptyUserForm()); }} className="btn-ghost !py-2 text-sm">
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="grid h-fit gap-3">
          {users.map((u) => (
            <div key={u.id} className="card flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-black">{u.name} {u.id === selfId && <span className="text-xs text-stone-400">(أنت)</span>}</p>
                <p className="text-xs text-stone-500" dir="ltr">{u.email}</p>
                <p className="mt-1 text-xs font-bold text-brand-700">
                  {u.role === "ADMIN" ? "مدير عام" : roleLabel(u)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditUser(u)} className="rounded-lg bg-sand-100 px-3 py-1 text-xs font-bold">تعديل</button>
                {u.id !== selfId && (
                  <button onClick={() => removeUser(u.id, u.name)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">حذف</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Roles ---- */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submitRole} className="card h-fit space-y-3 p-4">
          <p className="font-black">{editingRole ? `تعديل دور: ${editingRole.label}` : "إضافة دور مخصص"}</p>
          {!editingRole && (
            <div>
              <label className="label">اسم الدور * (English بدون مسافات)</label>
              <input value={rform.name} onChange={(e) => setRform({ ...rform, name: e.target.value })} className="input text-left" dir="ltr" placeholder="editor" required />
            </div>
          )}
          <div>
            <label className="label">الاسم المعروض *</label>
            <input value={rform.label} onChange={(e) => setRform({ ...rform, label: e.target.value })} className="input" placeholder="محرر محتوى" required />
          </div>
          <div>
            <label className="label">الصلاحيات</label>
            <div className="grid gap-1.5">
              {PERMISSIONS.map((p) => (
                <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded-lg bg-sand-50 px-3 py-2 text-sm font-bold">
                  <input type="checkbox" checked={rform.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} className="h-4 w-4" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="btn-primary flex-1 !py-2 text-sm">
              {loading ? "..." : editingRole ? "حفظ" : "إضافة"}
            </button>
            {editingRole && (
              <button type="button" onClick={() => { setEditingRole(null); setRform({ name: "", label: "", permissions: [] }); }} className="btn-ghost !py-2 text-sm">
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="grid h-fit gap-3 sm:grid-cols-2">
          {roles.map((r) => (
            <div key={r.id} className="card p-4">
              <p className="font-black">{r.label} {r.isSystem && <span className="text-xs text-stone-400">• نظام</span>}</p>
              <p className="text-xs text-stone-400" dir="ltr">{r.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.permissions.length === 0 && <span className="text-xs text-stone-400">بدون صلاحيات</span>}
                {r.permissions.map((p) => (
                  <span key={p} className="badge-soft">{PERMISSIONS.find((x) => x.key === p)?.label ?? p}</span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEditRole(r)} className="rounded-lg bg-sand-100 px-3 py-1 text-xs font-bold">تعديل</button>
                {!r.isSystem && (
                  <button onClick={() => removeRole(r.id, r.label)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">حذف</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
