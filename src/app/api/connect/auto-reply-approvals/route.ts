import { NextRequest, NextResponse } from "next/server";
import {
  approveAutoReplySender,
  getAutoReplyApprovals,
  pauseAutoReplySender
} from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

type ApprovalRequest = {
  provider?: unknown;
  senderIdentifier?: unknown;
  senderLabel?: unknown;
  action?: unknown;
};

export async function GET() {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to view approvals." }, { status: 401 });
  }

  const approvals = await getAutoReplyApprovals(account.id);
  return NextResponse.json({ approvals });
}

export async function POST(request: NextRequest) {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to manage approvals." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ApprovalRequest | null;
  const provider = body?.provider;
  const senderIdentifier =
    typeof body?.senderIdentifier === "string" ? body.senderIdentifier.trim() : "";
  const senderLabel = typeof body?.senderLabel === "string" ? body.senderLabel.trim() : "";
  const action = body?.action === "pause" ? "pause" : "approve";

  if (provider !== "gmail" && provider !== "tiktok") {
    return NextResponse.json({ error: "Provider is invalid." }, { status: 400 });
  }

  if (!senderIdentifier) {
    return NextResponse.json({ error: "Sender is required." }, { status: 400 });
  }

  const approval =
    action === "pause"
      ? await pauseAutoReplySender({
          ownerAccountId: account.id,
          provider,
          senderIdentifier
        })
      : await approveAutoReplySender({
          ownerAccountId: account.id,
          provider,
          senderIdentifier,
          senderLabel
        });

  return NextResponse.json({ approval });
}
