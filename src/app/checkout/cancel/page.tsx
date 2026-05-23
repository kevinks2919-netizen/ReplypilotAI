import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto mt-12 max-w-2xl rounded-lg border border-ink/10 bg-white/88 p-6 text-center shadow-soft sm:p-8">
        <h1 className="text-4xl font-semibold text-ink">Checkout canceled</h1>
        <p className="mt-4 text-base leading-7 text-ink/68">
          No payment was completed. You can return to pricing, join the beta, or
          keep testing the free dashboard.
        </p>
        <Link
          href="/#pricing"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
        >
          <ArrowLeft size={18} />
          Back to pricing
        </Link>
      </section>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
