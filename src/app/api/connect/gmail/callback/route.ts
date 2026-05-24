import { NextRequest, NextResponse } from "next/server";
import { connectGmailAccount } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export async function GET(request: NextRequest) {
  const account = await getCurrentTrialAccount();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!account) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!code || state !== account.id) {
    return NextResponse.redirect(new URL("/connected-accounts?gmail=failed", request.url));
  }

  try {
    await connectGmailAccount(account.id, code);
    return NextResponse.redirect(new URL("/connected-accounts?gmail=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/connected-accounts?gmail=failed", request.url));
  }
}
