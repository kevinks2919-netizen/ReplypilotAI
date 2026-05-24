import { NextRequest, NextResponse } from "next/server";
import {
  generateMockResponse,
  isTone,
  type SpendingPotential
} from "@/lib/mock-ai";
import { incrementReplyUsage, requireActiveTrialAccount } from "@/lib/trial-auth";

type GenerateRepliesRequest = {
  message?: unknown;
  tone?: unknown;
};

type GenerateRepliesResponse = {
  replies: string[];
  fanMood: string;
  urgencyScore: number;
  spendingPotential: SpendingPotential;
  source?: "mock" | "openai";
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    replies: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    fanMood: { type: "string" },
    urgencyScore: { type: "integer", minimum: 1, maximum: 10 },
    spendingPotential: { type: "string", enum: ["low", "medium", "high"] }
  },
  required: ["replies", "fanMood", "urgencyScore", "spendingPotential"]
};

export async function POST(request: NextRequest) {
  const trial = await requireActiveTrialAccount();

  if (!trial.ok) {
    return NextResponse.json({ error: trial.error }, { status: trial.status });
  }

  let body: GenerateRepliesRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const tone = body.tone;

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (!isTone(tone)) {
    return NextResponse.json({ error: "Tone is invalid." }, { status: 400 });
  }

  if (!hasUsableOpenAiKey(process.env.OPENAI_API_KEY)) {
    const account = await incrementReplyUsage(trial.account);
    return NextResponse.json({
      ...toApiResponse(generateMockResponse(message, tone), "mock"),
      account
    });
  }

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.2",
        instructions:
          "You are an assistant for a creator agency inbox team. Generate platform-safe, non-explicit, friendly replies. Do not mention adult content, sexual acts, nudity, or anything unsafe. Avoid manipulation, pressure, or promises. Keep replies warm, concise, and suitable for mainstream social platforms.",
        input: `Incoming fan message: ${message}\nRequested tone: ${tone}\nReturn exactly three reply options plus mood analysis.`,
        text: {
          format: {
            type: "json_schema",
            name: "creator_reply_generation",
            strict: true,
            schema: responseSchema
          }
        }
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return NextResponse.json(
        { error: `OpenAI request failed: ${errorText}` },
        { status: 502 }
      );
    }

    const payload = await openAiResponse.json();
    const parsed = parseOpenAiJson(payload);
    const safeResponse = normalizeApiResponse(parsed);

    const account = await incrementReplyUsage(trial.account);
    return NextResponse.json({ ...safeResponse, source: "openai", account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function toApiResponse(
  result: ReturnType<typeof generateMockResponse>,
  source: "mock" | "openai"
): GenerateRepliesResponse {
  return {
    replies: result.replies.map((reply) => reply.text),
    fanMood: result.analysis.fanMood,
    urgencyScore: result.analysis.urgencyScore,
    spendingPotential: result.analysis.spendingPotential,
    source
  };
}

function parseOpenAiJson(payload: unknown): unknown {
  const outputText = extractOutputText(payload);

  if (!outputText) {
    throw new Error("OpenAI response did not include output text.");
  }

  return JSON.parse(outputText);
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  if ("output_text" in payload && typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const output = "output" in payload ? payload.output : undefined;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item)) continue;
    const content = item.content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      if ("text" in part && typeof part.text === "string") return part.text;
    }
  }

  return null;
}

function normalizeApiResponse(payload: unknown): GenerateRepliesResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("OpenAI response had an invalid shape.");
  }

  const candidate = payload as Record<string, unknown>;
  const replies = Array.isArray(candidate.replies)
    ? candidate.replies.filter((reply): reply is string => typeof reply === "string")
    : [];
  const fanMood = typeof candidate.fanMood === "string" ? candidate.fanMood : "curious";
  const urgencyScore =
    typeof candidate.urgencyScore === "number"
      ? Math.min(10, Math.max(1, Math.round(candidate.urgencyScore)))
      : 5;
  const spendingPotential = normalizeSpendingPotential(candidate.spendingPotential);

  if (replies.length !== 3) {
    throw new Error("OpenAI response did not include exactly three replies.");
  }

  return {
    replies,
    fanMood,
    urgencyScore,
    spendingPotential
  };
}

function normalizeSpendingPotential(value: unknown): SpendingPotential {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}

function hasUsableOpenAiKey(value: string | undefined) {
  if (!value) return false;
  if (value === "your_real_key_here" || value === "your_api_key_here") return false;
  return value.length >= 20;
}
