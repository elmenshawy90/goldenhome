import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserPermissions } from "@/lib/guard";
import { getStaffRoles, getStaffUsers } from "@/lib/data";
import StaffManager from "./StaffManager";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login?next=/admin/staff");
  const perms = await getUserPermissions(session.id, session.role);
  if (!perms.includes("staff")) redirect("/admin");

  const [users, roles] = await Promise.all([getStaffUsers(), getStaffRoles()]);
  return <StaffManager initialUsers={users} initialRoles={roles} selfId={session.id} />;
}
