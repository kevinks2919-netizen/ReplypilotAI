import { NextRequest, NextResponse } from "next/server";
import { saveWaitlistLead, type WaitlistSubmissionInput } from "@/lib/waitlist";

export const runtime = "nodejs";

type WaitlistRequest = {
  name?: unknown;
  email?: unknown;
  profileType?: unknown;
  painPoint?: unknown;
  planInterest?: unknown;
};

export async function POST(request: NextRequest) {
  let body: WaitlistRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const profileType = normalizeProfileType(body.profileType);
  const painPoint = typeof body.painPoint === "string" ? body.painPoint.trim() : "";
  const planInterest = normalizePlanInterest(body.planInterest);

  if (!name || !email || !profileType || !painPoint) {
    return NextResponse.json(
      { error: "Name, email, profile type, and pain point are required." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const submission: WaitlistSubmissionInput = {
    id: crypto.randomUUID(),
    name,
    email,
    profile_type: profileType,
    biggest_pain_point: painPoint,
    plan_interest: planInterest,
    source: "replypilot_landing",
    status: "waitlisted",
    created_at: new Date().toISOString()
  };

  try {
    const result = await saveWaitlistLead(submission);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save submission.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeProfileType(value: unknown): WaitlistSubmissionInput["profile_type"] | null {
  if (value === "creator" || value === "agency") return value;
  return null;
}

function normalizePlanInterest(value: unknown): WaitlistSubmissionInput["plan_interest"] {
  if (value === "free" || value === "pro" || value === "agency") return value;
  return "beta";
}
