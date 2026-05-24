import { NextResponse } from "next/server";
import { getPublicConnectedAccounts, listGmailMessages } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export async function GET() {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to view connected messages." }, { status: 401 });
  }

  try {
    const connectedAccounts = await getPublicConnectedAccounts(account.id);
    const messages = await listGmailMessages(account.id);
    return NextResponse.json({ connectedAccounts, messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load Gmail messages." },
      { status: 500 }
    );
  }
}
