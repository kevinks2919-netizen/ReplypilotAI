import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    detail: "20 replies/day",
    cta: "Start free",
    features: ["Mock + API generation", "Mood detection", "Copy replies"]
  },
  {
    name: "Pro",
    price: "$10",
    detail: "per month",
    cta: "Go Pro",
    featured: true,
    features: ["Higher daily limits", "Priority generation", "Export all replies"]
  },
  {
    name: "Agency",
    price: "$19",
    detail: "per month",
    cta: "Book demo",
    features: ["Team workflow ready", "Account reporting", "White-glove setup"]
  }
];

const faqs = [
  ["Does ReplyPilot AI connect to fan platforms?", "Not yet. This MVP keeps generation separate from platform integrations so agencies can validate the workflow before connecting inbox sources."],
  ["What happens without an OpenAI key?", "The app falls back to mock replies so your workflow still works during testing, demos, and development."],
  ["Are replies explicit?", "No. The assistant is prompted to keep replies non-explicit, friendly, and suitable for mainstream platform policies."],
  ["How does safety and platform compliance work?", "ReplyPilot AI uses conservative instructions, avoids adult or manipulative language, and keeps humans in the loop before any reply is sent."],
  ["Does this replace team QA?", "No. It speeds up first drafts and triage, but agencies should still review replies against creator guidelines and platform terms."],
  ["Can agencies use this with a team?", "The Agency tier is designed as the future home for team seats, account reporting, usage limits, and approval workflows."]
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-lg font-bold text-ink">
          ReplyPilot AI
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold text-ink/64 md:flex">
          <a href="#solution" className="transition hover:text-coral">Solution</a>
          <a href="#pricing" className="transition hover:text-coral">Pricing</a>
          <a href="#faq" className="transition hover:text-coral">FAQ</a>
          <Link href="/outreach-kit" className="transition hover:text-coral">Outreach Kit</Link>
          <Link href="/admin" className="transition hover:text-coral">Admin</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-ink/70 transition hover:text-coral sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum"
          >
            Open app
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-coral/20 bg-white/75 px-3 py-2 text-sm font-semibold text-coral">
            <MessageSquareText size={16} />
            AI replies for creator agency inbox teams
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.04] text-ink sm:text-6xl">
            ReplyPilot AI helps creator agencies reply faster without sounding careless.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-ink/68 sm:text-lg">
            Generate polished reply options, identify high-intent conversations, and
            keep every response friendly, non-explicit, and platform-safe before a
            human hits send.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="#waitlist"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
            >
              Join Beta
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
            >
              Try Dashboard
            </Link>
            <a
              href="mailto:sales@replypilot.ai?subject=ReplyPilot%20AI%20Demo"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
            >
              Book Demo
            </a>
            <Link
              href="/outreach-kit"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ink/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
            >
              Outreach Kit
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-ink/72 sm:grid-cols-3">
            {["20 free replies/day", "OpenAI + mock fallback", "Human review friendly"].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 shrink-0 text-mint" size={17} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft backdrop-blur sm:p-5">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <div>
              <p className="text-sm font-semibold text-ink">Live reply preview</p>
              <p className="mt-1 text-xs text-ink/52">No platform connection required</p>
            </div>
            <ShieldCheck className="text-mint" size={24} />
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-mist p-4">
              <p className="text-sm leading-6 text-ink/78">
                Loved your latest post. What should I check out next?
              </p>
            </div>
            <div className="rounded-lg border border-coral/20 bg-coral/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">
                Suggested reply
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/78">
                That made me smile. I am glad you enjoyed it, and I would love to hear
                what kind of update you want to see next.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["Mood", "warm"], ["Urgency", "6/10"], ["Spend", "medium"]].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-ink p-3 text-white">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/8 bg-white/58 px-5 py-14 sm:px-8" id="problem">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["Slow replies", "Teams lose hours rewriting the same warm, safe responses."],
            ["Missed intent", "High-value messages blend into the rest of the inbox queue."],
            ["QA risk", "Off-brand, explicit, or too-forward messages can create platform risk."]
          ].map(([title, copy]) => (
            <div key={title} className="rounded-lg border border-ink/10 bg-white p-5">
              <p className="text-sm font-semibold text-coral">Problem</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/64">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" id="solution">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">Solution</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
            A focused reply copilot for paid creator operations.
          </h2>
          <p className="mt-4 text-base leading-7 text-ink/64">
            ReplyPilot AI does one job well: help inbox teams move from messy
            messages to safe, reviewed replies in fewer steps.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [Sparkles, "Generate", "Three reply options tuned to friendly, playful, flirty, professional, or funny tones."],
            [BarChart3, "Prioritize", "Mood, urgency, and spending potential help teams decide what to answer first."],
            [ShieldCheck, "Stay safe", "Prompts are designed for non-explicit, platform-safe replies by default."]
          ].map(([Icon, title, copy]) => (
            <div key={title as string} className="rounded-lg border border-ink/10 bg-white/82 p-5 shadow-sm">
              <Icon className="text-plum" size={24} />
              <h3 className="mt-4 text-lg font-semibold text-ink">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/64">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-7xl" id="how-it-works">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">How it works</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [MessageSquareText, "Paste a message", "Drop in the incoming fan message from your queue."],
              [Users, "Pick a tone", "Choose the voice that matches the creator and context."],
              [Clock3, "Copy and send", "Review three options, copy one, or export all replies."]
            ].map(([Icon, title, copy]) => (
              <div key={title as string} className="rounded-lg border border-white/10 bg-white/8 p-5">
                <Icon className="text-coral" size={24} />
                <h3 className="mt-4 text-lg font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-white/64">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["ReplyPilot AI feels like the first draft engine our inbox team actually wanted.", "Creator Ops Lead"],
            ["The mood and urgency signal makes triage simpler for junior chatters.", "Agency Founder"],
            ["The fallback mode helped us demo the workflow before billing was ready.", "Growth Manager"]
          ].map(([quote, role]) => (
            <figure key={role} className="rounded-lg border border-ink/10 bg-white/82 p-5">
              <blockquote className="text-sm leading-6 text-ink/76">{quote}</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-plum">{role}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" id="waitlist">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">
              Join Beta
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
              Get early access before paid checkout opens.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/68">
              Tell us who you are and what hurts most in your creator inbox workflow.
              Submissions are saved locally today in a Supabase-ready structure.
            </p>
            <div className="mt-5 rounded-lg border border-ink/10 bg-white/70 p-4 text-sm leading-6 text-ink/68">
              Stripe Checkout is wired for Pro and Agency. Add Stripe env vars to
              activate hosted subscription checkout.
            </div>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <section className="border-y border-ink/8 bg-white/58 px-5 py-16 sm:px-8" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
                Start free, upgrade when your inbox needs speed.
              </h2>
            </div>
            <a
              href="mailto:sales@replypilot.ai?subject=ReplyPilot%20AI%20Demo"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum"
            >
              Book Demo
            </a>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border p-5 ${
                  plan.featured
                    ? "border-coral bg-white shadow-soft"
                    : "border-ink/10 bg-white/82"
                }`}
              >
                <p className="text-lg font-semibold text-ink">{plan.name}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-ink">{plan.price}</span>
                  <span className="pb-1 text-sm text-ink/58">{plan.detail}</span>
                </div>
                <ul className="mt-5 space-y-3 text-sm text-ink/68">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-mint" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.name === "Free" ? (
                  <Link
                    href="#waitlist"
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-plum"
                  >
                    Join Beta
                  </Link>
                ) : (
                  <>
                    <CheckoutButton
                      plan={plan.name === "Pro" ? "pro" : "agency"}
                      label={`Start ${plan.name} checkout`}
                    />
                    <p className="mt-3 rounded-lg border border-mint/20 bg-mint/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mint">
                      Stripe hosted checkout
                    </p>
                    <Link
                      href={`/?plan=${plan.name.toLowerCase()}#waitlist`}
                      className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
                    >
                      Join {plan.name} waitlist
                    </Link>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8" id="faq">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">Questions before takeoff?</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-lg border border-ink/10 bg-white/82 p-5">
              <h3 className="font-semibold text-ink">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/64">{answer}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
