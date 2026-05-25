import { NextRequest, NextResponse } from "next/server";
import { sendGmailReply } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

type SendReplyRequest = {
  threadId?: unknown;
  to?: unknown;
  subject?: unknown;
  body?: unknown;
};

export async function POST(request: NextRequest) {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to send Gmail replies." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as SendReplyRequest | null;
  const threadId = typeof payload?.threadId === "string" ? payload.threadId.trim() : "";
  const to = typeof payload?.to === "string" ? payload.to.trim() : "";
  const subject = typeof payload?.subject === "string" ? payload.subject.trim() : "";
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";

  if (!threadId || !to || !subject || !body) {
    return NextResponse.json(
      { error: "Thread, recipient, subject, and reply body are required." },
      { status: 400 }
    );
  }

  try {
    const sentMessage = await sendGmailReply({
      ownerAccountId: account.id,
      threadId,
      to,
      subject,
      body
    });

    return NextResponse.json({ sentMessage });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send Gmail reply." },
      { status: 500 }
    );
  }
}
