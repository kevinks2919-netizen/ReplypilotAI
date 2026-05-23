import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Footer } from "@/components/Footer";
import { adminCookieName, isAdminConfigured, isValidAdminToken } from "@/lib/admin-auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = isValidAdminToken(cookieStore.get(adminCookieName)?.value);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition hover:text-coral"
          >
            <ArrowLeft size={17} />
            Home
          </Link>
          <div className="flex items-center gap-3">
            {isAuthed ? <AdminLogoutButton /> : null}
            <p className="text-sm font-semibold text-ink">ReplyPilot AI Admin</p>
          </div>
        </nav>

        {isAuthed ? (
          <>
            <section className="mb-6 rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                Internal dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-ink">Waitlist leads</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/64">
                Track early beta interest, creator versus agency split, common pain
                points, and export leads for follow-up.
              </p>
            </section>

            <AdminDashboard />
          </>
        ) : (
          <AdminLoginForm isConfigured={isAdminConfigured()} />
        )}
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
