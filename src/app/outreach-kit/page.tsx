import Link from "next/link";
import { ArrowLeft, ArrowRight, Megaphone } from "lucide-react";
import { CopyCard } from "@/components/CopyCard";
import { Footer } from "@/components/Footer";

const coldDms = [
  {
    title: "Agency Workflow Audit",
    body: "Hey [Name], noticed your agency manages multiple creators. ReplyPilot AI helps teams turn fan messages into three platform-safe reply options with mood and urgency scoring. Want me to send a quick 60-second demo?"
  },
  {
    title: "Inbox Speed Angle",
    body: "Hey [Name], quick idea for your chat team: ReplyPilot AI drafts safe, on-brand replies so agents can move faster without losing quality. It also flags urgency and spending potential. Open to checking it out?"
  },
  {
    title: "QA Risk Angle",
    body: "Hey [Name], creator inbox QA gets messy fast. ReplyPilot AI gives chatters safe reply drafts and signal scoring before they respond. It is built for agencies that want faster replies with less review risk."
  },
  {
    title: "Founder Direct",
    body: "Hey [Name], I am building ReplyPilot AI for creator agencies. It generates three non-explicit, platform-safe reply options from any fan message. If your team handles inbox volume, I would love your feedback."
  },
  {
    title: "Soft Demo Ask",
    body: "Hey [Name], not pitching a platform integration yet. ReplyPilot AI is a focused reply assistant for agency teams. Paste a fan message, pick a tone, get safe reply options plus mood and urgency. Want a demo link?"
  }
];

const tiktokIdeas = [
  {
    title: "POV: Your Inbox Team Has 300 Messages",
    body: "Hook: POV: your creator agency wakes up to 300 fan messages.\nShow: Paste a message into ReplyPilot AI, pick a tone, generate three replies.\nClose: Faster drafts, safer replies, better triage."
  },
  {
    title: "Before vs After Reply Workflow",
    body: "Hook: Before ReplyPilot AI, every reply started from scratch.\nShow: Split screen of manual typing vs generated options.\nClose: Your team still reviews, but the blank page is gone."
  },
  {
    title: "Mood Detection Demo",
    body: "Hook: Not every fan message should be treated the same.\nShow: One message scored as curious, another as eager, another as frustrated.\nClose: Prioritize the inbox with better context."
  },
  {
    title: "Safe Reply Challenge",
    body: "Hook: Can AI write replies that stay friendly and platform-safe?\nShow: Generate three non-explicit replies from a tricky message.\nClose: Built for creator teams that need speed and guardrails."
  },
  {
    title: "Agency SaaS MVP Build",
    body: "Hook: I built a SaaS MVP for creator agencies.\nShow: Homepage, pricing, dashboard, usage counter, reply generator.\nClose: ReplyPilot AI helps teams answer faster without connecting fan platforms yet."
  }
];

const twitterIdeas = [
  {
    title: "Launch Post",
    body: "Introducing ReplyPilot AI: a reply assistant for creator agency inbox teams.\n\nPaste a fan message. Pick a tone. Get 3 platform-safe reply options plus mood, urgency, and spending potential.\n\nBuilt as a focused MVP before platform integrations."
  },
  {
    title: "Problem Post",
    body: "Creator agencies do not just need more messages.\n\nThey need faster replies, safer drafts, and better triage.\n\nThat is the wedge for ReplyPilot AI."
  },
  {
    title: "Feature Post",
    body: "ReplyPilot AI dashboard now has:\n\n- 3 reply options\n- tone selector\n- usage counter\n- copy all replies\n- mood detection\n- OpenAI with mock fallback\n\nSmall SaaS MVP, real workflow."
  },
  {
    title: "Founder Build Post",
    body: "MVP lesson: do not start with every integration.\n\nReplyPilot AI starts with the core workflow: draft better replies from pasted messages.\n\nPlatform integrations can come after the value is obvious."
  },
  {
    title: "CTA Post",
    body: "Running a creator agency inbox team?\n\nI am looking for feedback on ReplyPilot AI: safe reply drafts, tone control, and inbox signal scoring.\n\nComment \"pilot\" and I will send the demo."
  }
];

const emailTemplates = [
  {
    title: "Short Agency Intro",
    body: "Subject: Faster creator inbox replies\n\nHi [Name],\n\nI am building ReplyPilot AI for creator agency teams that manage high-volume inboxes.\n\nThe dashboard turns a fan message into three platform-safe reply options, then adds mood, urgency, and spending potential so the team can triage faster.\n\nWould you be open to a 10-minute demo this week?\n\nBest,\n[Your Name]"
  },
  {
    title: "Problem Led Email",
    body: "Subject: Quick idea for your chat team\n\nHi [Name],\n\nCreator inbox teams spend a lot of time rewriting similar replies while still needing to avoid off-brand or risky messages.\n\nReplyPilot AI helps by generating friendly, non-explicit reply options with tone control and lightweight signal scoring.\n\nIt does not require a platform integration yet. Your team can paste a message, generate options, review, and copy.\n\nWorth a quick look?\n\nBest,\n[Your Name]"
  },
  {
    title: "Follow-Up Email",
    body: "Subject: Re: ReplyPilot AI demo\n\nHi [Name],\n\nQuick follow-up in case this got buried.\n\nReplyPilot AI is a lightweight reply assistant for creator agency inbox teams: three safe reply drafts, tone control, mood detection, urgency scoring, and copy/export actions.\n\nIf inbox speed or QA is a priority, I can send a short demo.\n\nBest,\n[Your Name]"
  }
];

const demoScript =
  "0-10s: Open with the problem. Creator agency inbox teams need to reply quickly, but every message still needs to feel safe, friendly, and on-brand.\n\n10-25s: Show the dashboard. Paste an incoming fan message, choose a tone like friendly or playful, then click Generate.\n\n25-40s: Show the output. ReplyPilot AI creates three platform-safe reply options and adds mood, urgency score, and spending potential.\n\n40-50s: Show workflow actions. Copy one reply or use Copy all replies to export the full set for review.\n\n50-60s: Close with the value. ReplyPilot AI helps agencies move faster today without connecting to fan platforms yet. Book a demo or try the dashboard.";

const sections = [
  ["Cold DM Templates", coldDms],
  ["TikTok Video Script Ideas", tiktokIdeas],
  ["X/Twitter Post Ideas", twitterIdeas],
  ["Email Templates", emailTemplates]
] as const;

export default function OutreachKitPage() {
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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum"
          >
            Open app
            <ArrowRight size={16} />
          </Link>
        </nav>

        <section className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-lg border border-coral/20 bg-coral/8 px-3 py-2 text-sm font-semibold text-coral">
            <Megaphone size={16} />
            Growth assets
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            ReplyPilot AI Outreach Kit
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/68">
            Copy-ready outreach assets for selling ReplyPilot AI to creator
            agencies, testing social content, and running a concise product demo.
          </p>
        </section>

        <div className="mt-8 space-y-10">
          {sections.map(([sectionTitle, items]) => (
            <section key={sectionTitle}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
                ReplyPilot AI
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">{sectionTitle}</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {items.map((item, index) => (
                  <CopyCard
                    key={item.title}
                    label={`${sectionTitle.split(" ")[0]} ${index + 1}`}
                    title={item.title}
                    body={item.body}
                  />
                ))}
              </div>
            </section>
          ))}

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
              Product walkthrough
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              60-Second Demo Script
            </h2>
            <div className="mt-4">
              <CopyCard
                label="Demo"
                title="Simple 60-second walkthrough"
                body={demoScript}
              />
            </div>
          </section>
        </div>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
