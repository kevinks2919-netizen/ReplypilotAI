import { NextResponse } from "next/server";
import { dismissConnectedMessage } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

type DismissMessagePayload = {
  provider?: unknown;
  messageIdentifier?: unknown;
  senderIdentifier?: unknown;
  senderLabel?: unknown;
};

export async function POST(request: Request) {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to dismiss messages." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as DismissMessagePayload;

    if (payload.provider !== "gmail" && payload.provider !== "x" && payload.provider !== "tiktok") {
      return NextResponse.json({ error: "Unsupported message provider." }, { status: 400 });
    }

    if (
      typeof payload.messageIdentifier !== "string" ||
      typeof payload.senderIdentifier !== "string" ||
      typeof payload.senderLabel !== "string"
    ) {
      return NextResponse.json({ error: "Message details are required." }, { status: 400 });
    }

    const dismissal = await dismissConnectedMessage({
      ownerAccountId: account.id,
      provider: payload.provider,
      messageIdentifier: payload.messageIdentifier,
      senderIdentifier: payload.senderIdentifier,
      senderLabel: payload.senderLabel
    });

    return NextResponse.json({ dismissal });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not dismiss message." },
      { status: 500 }
    );
  }
}
