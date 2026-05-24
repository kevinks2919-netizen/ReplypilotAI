import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck
} from "lucide-react";
import { Footer } from "@/components/Footer";

const integrations = [
  {
    name: "Instagram DMs",
    status: "Planned",
    detail: "Official Meta review and approved API access required before inbox sync.",
    icon: MessageCircle
  },
  {
    name: "TikTok",
    status: "Researching",
    detail: "Creator messaging support depends on available platform permissions.",
    icon: Send
  },
  {
    name: "X / Twitter",
    status: "Planned",
    detail: "Direct message access will use approved API permissions where available.",
    icon: MessageCircle
  },
  {
    name: "Email / Gmail",
    status: "Best first integration",
    detail: "A safer first live connector for agencies that route fan requests by email.",
    icon: Mail
  }
];

const workflow = [
  "Client connects an approved account with OAuth.",
  "ReplyPilot AI reads inbound messages through official APIs.",
  "The app drafts safe reply options and triage signals.",
  "A human reviews and sends from the approved workflow."
];

export default function ConnectedAccountsPage() {
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
            <p className="text-sm font-semibold text-ink">ReplyPilot AI</p>
          </div>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-mint/20 bg-white/75 px-3 py-2 text-sm font-semibold text-mint">
              <ShieldCheck size={16} />
              Safe integrations roadmap
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
              Connect accounts only through approved platform access.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/68">
              ReplyPilot AI is built for human-reviewed reply workflows today.
              Direct inbox sync and sending will be added only where official APIs,
              permissions, and platform terms allow it.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
              >
                Use manual dashboard
              </Link>
              <a
                href="mailto:sales@replypilot.ai?subject=ReplyPilot%20AI%20Connector%20Demo"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
              >
                Request connector demo
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex items-start gap-3 rounded-lg bg-mist p-4">
              <LockKeyhole className="mt-0.5 shrink-0 text-plum" size={22} />
              <div>
                <h2 className="font-semibold text-ink">Current status</h2>
                <p className="mt-2 text-sm leading-6 text-ink/66">
                  No client platform accounts are connected yet. The app generates
                  reply drafts from pasted messages while integration access is reviewed.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {integrations.map((integration) => (
                <div key={integration.name} className="rounded-lg border border-ink/10 bg-white p-4">
                  <integration.icon className="text-coral" size={22} />
                  <h3 className="mt-3 font-semibold text-ink">{integration.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-mint">
                    {integration.status}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink/62">{integration.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-ink/10 bg-white/82 p-5">
            <Clock3 className="text-plum" size={24} />
            <h2 className="mt-4 text-2xl font-semibold text-ink">Launch-safe promise</h2>
            <p className="mt-3 text-sm leading-6 text-ink/64">
              Before any auto-reply feature ships, ReplyPilot AI should support account
              consent, human review, audit history, and platform-specific compliance checks.
            </p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white/82 p-5">
            <h2 className="text-2xl font-semibold text-ink">Approved connector workflow</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {workflow.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg bg-mist p-4 text-sm leading-6 text-ink/70">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-mint" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
