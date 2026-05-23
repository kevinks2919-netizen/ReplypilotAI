import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto mt-12 max-w-2xl rounded-lg border border-ink/10 bg-white/88 p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-mint/15 text-mint">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-ink">Checkout complete</h1>
        <p className="mt-4 text-base leading-7 text-ink/68">
          Thanks for subscribing to ReplyPilot AI. Account provisioning is still
          manual in this MVP, so use the dashboard while subscription fulfillment
          is finalized.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
        >
          Open dashboard
          <ArrowRight size={18} />
        </Link>
      </section>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
