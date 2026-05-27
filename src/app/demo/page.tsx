import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PlayCircle } from "lucide-react";
import { Footer } from "@/components/Footer";

const walkthroughSteps = [
  "Start from the homepage and understand the offer.",
  "Log in before using the client demo and connected inbox tools.",
  "Use the dashboard to paste a message, choose a tone, and generate replies.",
  "Connect Gmail or request X, TikTok, and OnlyFans connector support.",
  "Approve only specific senders before reply options are generated.",
  "Edit, copy, send, dismiss, and build fan memory safely.",
  "Use the admin dashboard to track leads and connector requests."
];

export default function DemoPage() {
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
            <Link
              href="/dashboard"
              className="rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral"
            >
              Dashboard
            </Link>
            <Link
              href="/connected-accounts"
              className="rounded-lg border border-ink/10 bg-white/72 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-coral hover:text-coral"
            >
              Connectors
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-coral/20 bg-white/75 px-3 py-2 text-sm font-semibold text-coral">
              <PlayCircle size={17} />
              Client walkthrough
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
              Watch how a client uses ReplyPilot AI.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/68">
              This walkthrough shows the web app experience from landing page to
              login, reply generation, connector requests, Gmail approval, dismissals,
              fan memory, and admin tracking.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
              >
                Try the demo
              </Link>
              <Link
                href="/admin"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
              >
                View admin
              </Link>
              <Link
                href="/google-verification-demo"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
              >
                Google verification demo
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white/88 p-3 shadow-soft">
            <Image
              src="/demo/replypilot-client-walkthrough.gif"
              alt="Animated walkthrough showing how clients use ReplyPilot AI"
              width={1280}
              height={720}
              unoptimized
              priority
              className="aspect-video w-full rounded-lg object-cover"
            />
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft sm:p-6">
          <h2 className="text-2xl font-semibold text-ink">What the video covers</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {walkthroughSteps.map((step) => (
              <div key={step} className="flex gap-3 rounded-lg bg-mist p-4 text-sm leading-6 text-ink/70">
                <CheckCircle2 className="mt-0.5 shrink-0 text-mint" size={18} />
                {step}
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
