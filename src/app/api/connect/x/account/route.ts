import { NextResponse } from "next/server";
import { getPublicXConnectedAccount } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export async function GET() {
  try {
    const account = await getCurrentTrialAccount();

    if (!account) {
      return NextResponse.json({ account: null }, { status: 401 });
    }

    const xAccount = await getPublicXConnectedAccount(account.id);
    return NextResponse.json({ account: xAccount });
  } catch (error) {
    return NextResponse.json(
      {
        account: null,
        error: error instanceof Error ? error.message : "Could not load X account."
      },
      { status: 500 }
    );
  }
}
