import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Footer } from "@/components/Footer";
import { TrialLoginForm } from "@/components/TrialLoginForm";

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
            Start a 14-day demo with 20 reply generations tied to your email.
            After the trial, choose Pro or Agency to keep generating replies.
          </p>

          <div className="mt-6">
            <TrialLoginForm />
          </div>
        </section>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
