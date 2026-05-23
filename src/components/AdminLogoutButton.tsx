"use client";

export function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral"
    >
      Logout
    </button>
  );
}
