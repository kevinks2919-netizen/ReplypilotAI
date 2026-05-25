import { NextRequest, NextResponse } from "next/server";
import {
  getTikTokConnectionRequests,
  requestTikTokConnection
} from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

type TikTokRequestBody = {
  tiktokHandle?: unknown;
  accountType?: unknown;
  notes?: unknown;
};

export async function GET() {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to view TikTok requests." }, { status: 401 });
  }

  const requests = await getTikTokConnectionRequests(account.id);
  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to request TikTok access." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as TikTokRequestBody | null;
  const tiktokHandle = typeof body?.tiktokHandle === "string" ? body.tiktokHandle.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const accountType = normalizeAccountType(body?.accountType);

  try {
    const tiktokRequest = await requestTikTokConnection({
      ownerAccountId: account.id,
      tiktokHandle,
      accountType,
      notes
    });

    return NextResponse.json({ request: tiktokRequest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not request TikTok access." },
      { status: 400 }
    );
  }
}

function normalizeAccountType(value: unknown): "creator" | "agency" | "brand" {
  if (value === "creator" || value === "agency" || value === "brand") return value;
  return "creator";
}
