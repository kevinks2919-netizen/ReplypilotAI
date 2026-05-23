import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "Using ReplyPilot AI",
    body: "ReplyPilot AI provides tools for drafting creator inbox replies, reviewing message signals, managing waitlist leads, and preparing outreach assets. You are responsible for reviewing all outputs before sending or publishing them. AI-generated content may be inaccurate, incomplete, or unsuitable for a specific context."
  },
  {
    title: "Human Review Required",
    body: "ReplyPilot AI is a drafting and triage assistant, not an autopilot. You agree that a human should review generated replies for accuracy, safety, tone, creator guidelines, and platform rules before use."
  },
  {
    title: "Platform Safety and Compliance",
    body: "You may not use ReplyPilot AI to create explicit sexual content, harassment, threats, deception, illegal content, spam, or messages that violate the policies of platforms where you communicate. You are responsible for complying with all fan platform, social platform, payment provider, and agency policies that apply to your use."
  },
  {
    title: "Acceptable Use",
    body: "You may not misuse the service, attempt to bypass security, scrape or overload the service, upload malicious code, infringe intellectual property rights, violate privacy rights, or use the service to process highly sensitive information such as payment card data, government identifiers, protected health data, or content you do not have permission to process."
  },
  {
    title: "Accounts and Admin Access",
    body: "Current admin access uses a simple password gate for MVP testing. If you receive admin access, you are responsible for keeping credentials confidential and for all activity under your access. Public launch should use stronger authentication before exposing sensitive lead or customer information."
  },
  {
    title: "Subscriptions and Payments",
    body: "Pricing is currently shown for product validation. Paid checkout is marked Coming Soon until Stripe or another payment provider is connected. No paid subscription is active until checkout is live and a payment is completed."
  },
  {
    title: "Beta and Availability",
    body: "ReplyPilot AI is currently an MVP/beta product. Features may change, break, or be removed. We may limit, suspend, or discontinue access at any time, especially to protect users, comply with law, or prevent misuse."
  },
  {
    title: "Ownership",
    body: "ReplyPilot AI, including its software, branding, interface, and product materials, belongs to its owner. You retain responsibility for content you submit. Subject to these Terms, you may use generated drafts for your business after reviewing them."
  },
  {
    title: "Third-Party Services",
    body: "ReplyPilot AI may rely on providers such as OpenAI, Supabase, Vercel, and Stripe. Your use of the service may involve those providers processing information as described in the Privacy Policy."
  },
  {
    title: "Disclaimers",
    body: "The service is provided as is and as available. We do not guarantee that outputs will be error-free, compliant with every platform policy, or suitable for every creator, agency, or jurisdiction."
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, ReplyPilot AI will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or business interruption arising from use of the service."
  },
  {
    title: "Changes to These Terms",
    body: "We may update these Terms as the product develops. Continued use after changes means you accept the updated Terms."
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-coral">
          <ArrowLeft size={17} />
          Home
        </Link>
        <section className="mt-8 rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
            Effective May 23, 2026
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">Terms of Service</h1>
          <p className="mt-4 text-sm leading-7 text-ink/66">
            These Terms govern access to and use of ReplyPilot AI. They are a
            practical launch draft for beta use and should be reviewed by qualified
            counsel before paid public launch.
          </p>

          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-ink/66">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-lg border border-ink/10 bg-mist p-4">
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-2 text-sm leading-7 text-ink/66">
              Questions about these Terms can be sent to{" "}
              <a className="font-semibold text-coral" href="mailto:hello@replypilot.ai">
                hello@replypilot.ai
              </a>
              .
            </p>
          </section>
        </section>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
