import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardGenerator } from "@/components/DashboardGenerator";
import { Footer } from "@/components/Footer";

export default function DashboardPage() {
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
              href="/login"
              className="rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral"
            >
              Login
            </Link>
            <p className="text-sm font-semibold text-ink">ReplyPilot AI</p>
          </div>
        </nav>
        <DashboardGenerator />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
