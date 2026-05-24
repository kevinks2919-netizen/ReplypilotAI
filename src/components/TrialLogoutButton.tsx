"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TrialLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut size={16} />
      {isLoggingOut ? "Logging out" : "Logout"}
    </button>
  );
}
