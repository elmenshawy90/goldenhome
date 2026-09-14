"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/auth/session", { method: "POST" });
        // session route handles GET; logout is cookie clear via login route? use direct:
        document.cookie = "gh_token=; Max-Age=0; path=/";
        router.push("/login");
        router.refresh();
      }}
      className="rounded-xl border border-sand-300 px-3 py-1.5 text-xs font-bold hover:bg-sand-100"
    >
      خروج
    </button>
  );
}
