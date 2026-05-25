import { NextResponse } from "next/server";
import { getOnlyFansConnectionRequests, requestOnlyFansConnection } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

type OnlyFansRequestPayload = {
  onlyFansHandle?: unknown;
  accountType?: unknown;
  notes?: unknown;
};

export async function GET() {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to view OnlyFans connector requests." }, { status: 401 });
  }

  try {
    const requests = await getOnlyFansConnectionRequests(account.id);
    return NextResponse.json({ requests: requests.toReversed() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load OnlyFans requests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const account = await getCurrentTrialAccount();

  if (!account) {
    return NextResponse.json({ error: "Log in to request OnlyFans access." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as OnlyFansRequestPayload;

    if (payload.accountType !== "creator" && payload.accountType !== "agency" && payload.accountType !== "brand") {
      return NextResponse.json({ error: "Choose creator, agency, or brand." }, { status: 400 });
    }

    if (typeof payload.onlyFansHandle !== "string") {
      return NextResponse.json({ error: "OnlyFans handle is required." }, { status: 400 });
    }

    const connectorRequest = await requestOnlyFansConnection({
      ownerAccountId: account.id,
      onlyFansHandle: payload.onlyFansHandle,
      accountType: payload.accountType,
      notes: typeof payload.notes === "string" ? payload.notes : ""
    });

    return NextResponse.json({ request: connectorRequest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not request OnlyFans access." },
      { status: 500 }
    );
  }
}
