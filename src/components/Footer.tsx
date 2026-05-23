import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white/62 px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-ink">ReplyPilot AI</p>
          <p className="mt-1 text-sm text-ink/56">
            Platform-safe reply workflows for creator agency inbox teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-ink/62">
          <Link href="/privacy" className="transition hover:text-coral">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-coral">
            Terms
          </Link>
          <a href="mailto:hello@replypilot.ai" className="transition hover:text-coral">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
