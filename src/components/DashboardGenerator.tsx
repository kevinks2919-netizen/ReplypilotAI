"use client";

import { Copy, Files, Loader2, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  generateMockResponse,
  type GenerationResult,
  type SpendingPotential,
  type Tone
} from "@/lib/mock-ai";

const tones: Tone[] = ["friendly", "playful", "flirty", "professional", "funny"];

const sampleMessage =
  "I loved your last post. Do you have anything special I can unlock today?";

type GenerateRepliesApiResponse = {
  replies: string[];
  fanMood: string;
  urgencyScore: number;
  spendingPotential: SpendingPotential;
  source?: "mock" | "openai";
};

export function DashboardGenerator() {
  const [message, setMessage] = useState(sampleMessage);
  const [tone, setTone] = useState<Tone>("friendly");
  const [result, setResult] = useState<GenerationResult>(() =>
    generateMockResponse(sampleMessage, "friendly")
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const canGenerate = useMemo(() => message.trim().length > 0, [message]);
  const usageLimit = 20;
  const usagePercent = Math.min(100, (usageCount / usageLimit) * 100);

  async function handleGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          tone
        })
      });

      const payload = (await response.json()) as GenerateRepliesApiResponse;

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload));
      }

      setResult({
        replies: payload.replies.map((reply, index) => ({
          id: index + 1,
          text: reply
        })),
        analysis: {
          fanMood: payload.fanMood,
          urgencyScore: payload.urgencyScore,
          spendingPotential: payload.spendingPotential
        },
        source: payload.source ?? "openai"
      });
      setCopiedId(null);
      setCopiedAll(false);
      setUsageCount((count) => Math.min(usageLimit, count + 1));
    } catch (error) {
      const fallback = generateMockResponse(message, tone);
      setResult({
        ...fallback,
        source: "fallback",
        error: error instanceof Error ? error.message : "Using mock replies after an API error."
      });
      setCopiedId(null);
      setCopiedAll(false);
      setUsageCount((count) => Math.min(usageLimit, count + 1));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy(id: number, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
  }

  async function handleCopyAll() {
    const exportText = result.replies
      .map((reply) => `Option ${reply.id}: ${reply.text}`)
      .join("\n\n");

    await navigator.clipboard.writeText(exportText);
    setCopiedAll(true);
    setCopiedId(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.42fr)] xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.5fr)]">
      <section className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft backdrop-blur sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
              ReplyPilot AI studio
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
              Generate creator-safe replies
            </h1>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-mist/70 p-3 sm:min-w-56">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                Usage today
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {usageCount}/{usageLimit} replies
              </p>
            </div>
            <Sparkles className="text-mint" size={22} aria-hidden="true" />
          </div>
        </div>

        <div className="mb-5 h-2 rounded-full bg-ink/8">
          <div
            className="h-2 rounded-full bg-mint transition-all"
            style={{ width: `${usagePercent}%` }}
          />
        </div>

        <label className="text-sm font-medium text-ink" htmlFor="fan-message">
          Incoming fan message
        </label>
        <textarea
          id="fan-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-2 min-h-44 w-full resize-y rounded-lg border border-ink/15 bg-mist/60 p-4 text-sm leading-6 text-ink outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
          placeholder="Paste the incoming fan message here..."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="tone">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(event) => setTone(event.target.value as Tone)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm capitalize outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
            >
              {tones.map((toneOption) => (
                <option key={toneOption} value={toneOption}>
                  {toneOption}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:bg-ink/40 md:w-auto"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-ink">Generated replies</p>
            <p className="mt-1 text-xs text-ink/52">Review, copy one option, or export the full set.</p>
          </div>
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral"
          >
            <Files size={16} />
            {copiedAll ? "Copied all" : "Copy all replies"}
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {isGenerating ? (
            [0, 1, 2].map((item) => (
              <div key={item} className="rounded-lg border border-ink/10 bg-mist/55 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-ink/10" />
                  <div className="h-8 w-20 animate-pulse rounded-lg bg-ink/10" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 animate-pulse rounded bg-ink/10" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-ink/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-ink/10" />
                </div>
              </div>
            ))
          ) : result.replies.map((reply) => (
            <article
              key={reply.id}
              className="rounded-lg border border-ink/10 bg-mist/55 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-plum">Option {reply.id}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(reply.id, reply.text)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-coral hover:text-coral"
                >
                  <Copy size={15} />
                  {copiedId === reply.id ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/78">{reply.text}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-lg border border-ink/10 bg-ink p-4 text-white shadow-soft sm:p-5 lg:sticky lg:top-5 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
          Mood detection
        </p>
        <h2 className="mt-2 text-xl font-semibold">Fan signal summary</h2>

        <dl className="mt-6 grid gap-4">
          <div className="rounded-lg bg-white/8 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
              Fan mood
            </dt>
            <dd className="mt-2 text-2xl font-semibold capitalize">{result.analysis.fanMood}</dd>
          </div>
          <div className="rounded-lg bg-white/8 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
              Urgency score
            </dt>
            <dd className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-semibold">{result.analysis.urgencyScore}</span>
              <span className="pb-1 text-sm text-white/55">/ 10</span>
            </dd>
            <div className="mt-4 h-2 rounded-full bg-white/12">
              <div
                className="h-2 rounded-full bg-coral"
                style={{ width: `${result.analysis.urgencyScore * 10}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-white/8 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
              Spending potential
            </dt>
            <dd className="mt-2 text-2xl font-semibold capitalize">
              {result.analysis.spendingPotential}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg border border-white/10 p-4 text-sm leading-6 text-white/68">
          {getSourceMessage(result)}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
            Current plan
          </p>
          <p className="mt-2 text-lg font-semibold">Free</p>
          <p className="mt-1 text-sm text-white/60">20 replies/day included</p>
        </div>
      </aside>
    </div>
  );
}

function getSourceMessage(result: GenerationResult) {
  if (result.source === "openai") {
    return "OpenAI generated these platform-safe reply options.";
  }

  if (result.source === "fallback") {
    return `API fallback is active. ${result.error ?? "Using mock replies for now."}`;
  }

  return "Mock AI is active. Add OPENAI_API_KEY to .env.local to use OpenAI.";
}

function getApiErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (typeof error === "string") return error;
  }

  return "Could not generate replies with the API.";
}
