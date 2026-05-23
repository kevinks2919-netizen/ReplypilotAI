import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto mt-12 max-w-2xl rounded-lg border border-ink/10 bg-white/88 p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-mint/15 text-mint">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-ink">You are on the beta list.</h1>
        <p className="mt-4 text-base leading-7 text-ink/68">
          Thanks for joining ReplyPilot AI. Payment is still coming soon while Stripe
          gets connected, so beta access and plan interest are being tracked first.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
          >
            Try the dashboard
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/outreach-kit"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
          >
            View Outreach Kit
          </Link>
        </div>
      </section>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
