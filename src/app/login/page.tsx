import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition hover:text-coral"
        >
          <ArrowLeft size={17} />
          Home
        </Link>

        <section className="mt-10 rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mint/15 text-mint">
            <LockKeyhole size={24} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-ink">Login to ReplyPilot AI</h1>
          <p className="mt-3 text-sm leading-6 text-ink/64">
            Authentication is coming soon. This placeholder marks where team login,
            billing, and account usage limits will live.
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-lg border border-ink/15 bg-mist/60 px-4 py-3 text-sm outline-none"
              placeholder="Email address"
              disabled
            />
            <input
              className="w-full rounded-lg border border-ink/15 bg-mist/60 px-4 py-3 text-sm outline-none"
              placeholder="Password"
              type="password"
              disabled
            />
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
            >
              Continue to demo dashboard
            </Link>
          </div>
        </section>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
