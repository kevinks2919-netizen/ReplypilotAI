import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, including waitlist details such as name, email address, creator or agency type, biggest pain point, and plan interest. If you use the dashboard, you may enter fan messages or draft content for reply generation. We may also collect basic technical information such as browser type, device information, IP address, timestamps, and usage events if analytics or hosting logs are enabled."
  },
  {
    title: "How We Use Information",
    body: "We use information to operate ReplyPilot AI, manage the beta waitlist, respond to demo or contact requests, improve product workflows, generate reply options, troubleshoot errors, prevent abuse, and prepare future billing or account features. We do not sell personal information."
  },
  {
    title: "AI Processing",
    body: "ReplyPilot AI may send message text, selected tone, and related prompt instructions to AI providers such as OpenAI to generate reply options and mood analysis. You should not enter sensitive personal information, payment details, government identifiers, health data, or content you do not have permission to process. AI outputs should be reviewed by a human before use."
  },
  {
    title: "Service Providers",
    body: "We use service providers to host, store, and process data. Current or planned providers include Vercel for hosting, Supabase for waitlist and database storage, OpenAI for AI generation, and Stripe for future payments. These providers process information only as needed to provide their services to ReplyPilot AI."
  },
  {
    title: "Data Retention",
    body: "We keep waitlist and account-related information while it is needed to operate the beta, contact interested users, provide support, meet legal obligations, and improve the product. You can request deletion of your waitlist submission by contacting us."
  },
  {
    title: "Security",
    body: "We use reasonable technical and organizational safeguards, including server-side environment variables for secret keys and admin password protection for internal lead views. No online service can guarantee absolute security, so you should avoid submitting highly sensitive data."
  },
  {
    title: "Your Choices",
    body: "You may ask to access, correct, or delete personal information you provided. You can also ask us to stop contacting you about the beta. Depending on your location, you may have additional privacy rights under local law."
  },
  {
    title: "International Users",
    body: "ReplyPilot AI may use providers and infrastructure located in the United States or other countries. If you access the service from outside the United States, your information may be processed in countries with different data protection rules."
  },
  {
    title: "Children",
    body: "ReplyPilot AI is not intended for children under 13, and we do not knowingly collect personal information from children."
  },
  {
    title: "Changes",
    body: "We may update this Privacy Policy as the product, providers, or legal requirements change. The updated version will be posted on this page with a new effective date."
  }
];

export default function PrivacyPage() {
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
          <h1 className="mt-3 text-4xl font-semibold text-ink">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-7 text-ink/66">
            This Privacy Policy explains how ReplyPilot AI collects, uses, and
            protects information when you use our website, waitlist, dashboard,
            outreach kit, admin tools, and related services. This is a practical
            launch draft and should be reviewed by qualified counsel before public
            paid launch.
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
              For privacy questions or deletion requests, contact us at{" "}
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
