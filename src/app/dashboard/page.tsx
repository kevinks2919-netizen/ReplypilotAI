import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardGenerator } from "@/components/DashboardGenerator";
import { Footer } from "@/components/Footer";
import { TrialLogoutButton } from "@/components/TrialLogoutButton";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export default async function DashboardPage() {
  const account = await getCurrentTrialAccount();

  if (!account) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition hover:text-coral"
          >
            <ArrowLeft size={17} />
            Home
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/connected-accounts"
              className="rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral"
            >
              Integrations
            </Link>
            <Link
              href="/#pricing"
              className="rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral"
            >
              Upgrade
            </Link>
            <TrialLogoutButton />
            <p className="text-sm font-semibold text-ink">ReplyPilot AI</p>
          </div>
        </nav>
        <DashboardGenerator account={account} />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
