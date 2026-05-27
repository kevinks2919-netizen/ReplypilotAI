import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";

const scopeUses = [
  {
    scope: "gmail.readonly",
    use: "Shows recent inbound Gmail messages inside ReplyPilot AI so the user can review sender, subject, date, and snippet before generating replies.",
    icon: Mail
  },
  {
    scope: "gmail.send",
    use: "Sends a reply only after the authenticated user reviews the generated text, edits it if needed, and clicks Send.",
    icon: Send
  },
  {
    scope: "openid / email / profile",
    use: "Identifies the connected Google account and displays the connected Gmail address to the user.",
    icon: ShieldCheck
  }
];

const demoSteps = [
  "User logs in to ReplyPilot AI.",
  "User opens Connected Accounts and clicks Connect Gmail.",
  "Google OAuth asks the user to approve Gmail read/send permissions.",
  "ReplyPilot shows recent Gmail message previews using read-only access.",
  "User approves only a specific sender before reply options are generated.",
  "ReplyPilot generates safe, non-explicit reply options for human review.",
  "User edits the selected reply if needed.",
  "User clicks Send, and ReplyPilot sends that reviewed reply through Gmail.",
  "User can dismiss a message from ReplyPilot without deleting it from Gmail.",
  "After sending, ReplyPilot stores lightweight fan memory for continuity."
];

export default function GoogleVerificationDemoPage() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition hover:text-coral"
          >
            <ArrowLeft size={17} />
            Demo
          </Link>
          <Link href="/" className="text-sm font-semibold text-ink">
            ReplyPilot AI
          </Link>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-mint/20 bg-white/75 px-3 py-2 text-sm font-semibold text-mint">
              <ShieldCheck size={17} />
              Google OAuth verification demo
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
              How ReplyPilot AI uses Gmail permissions.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/68">
              This page is designed for Google OAuth app verification. It explains
              how ReplyPilot AI uses Gmail read-only and send scopes in a
              human-reviewed creator agency inbox workflow.
            </p>
            <div className="mt-6 rounded-lg border border-coral/20 bg-coral/8 p-4 text-sm leading-6 text-coral">
              ReplyPilot AI does not delete Gmail messages, does not send messages
              automatically to every sender, and does not use Gmail data for ads or resale.
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white/88 p-3 shadow-soft">
            <Image
              src="/demo/replypilot-client-walkthrough.gif"
              alt="ReplyPilot AI walkthrough for Gmail message review and sending"
              width={1280}
              height={720}
              unoptimized
              priority
              className="aspect-video w-full rounded-lg object-cover"
            />
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {scopeUses.map((item) => (
            <div key={item.scope} className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-sm">
              <item.icon className="text-coral" size={24} />
              <h2 className="mt-4 text-lg font-semibold text-ink">{item.scope}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/64">{item.use}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft sm:p-6">
          <h2 className="text-2xl font-semibold text-ink">Demo flow to show in the YouTube video</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {demoSteps.map((step) => (
              <div key={step} className="flex gap-3 rounded-lg bg-mist p-4 text-sm leading-6 text-ink/70">
                <CheckCircle2 className="mt-0.5 shrink-0 text-mint" size={18} />
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft sm:p-6">
          <h2 className="text-2xl font-semibold">Suggested voiceover script</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            ReplyPilot AI helps creator agencies review Gmail messages and generate
            platform-safe AI reply drafts. Gmail read-only access is used to show
            recent inbound message previews inside the connected accounts dashboard.
            Gmail send access is used only after the user approves a sender, reviews
            a generated reply, edits it if needed, and clicks Send. The app does not
            delete Gmail messages, does not automatically send replies to every
            sender, and keeps the user in control of the reply workflow.
          </p>
        </section>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
