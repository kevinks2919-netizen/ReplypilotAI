"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyCardProps = {
  title: string;
  label?: string;
  body: string;
};

export function CopyCard({ title, label, body }: CopyCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {label ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">
              {label}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-semibold text-ink">{title}</h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-ink/70">{body}</p>
    </article>
  );
}
