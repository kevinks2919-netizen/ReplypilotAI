import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectXAccount } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

type XOAuthCookie = {
  codeVerifier?: unknown;
  state?: unknown;
};

export async function GET(request: NextRequest) {
  const account = await getCurrentTrialAccount().catch(() => null);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const oauthCookie = parseOAuthCookie(cookieStore.get("replypilot_x_oauth")?.value);

  if (!account) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    !code ||
    !state ||
    state !== oauthCookie.state ||
    typeof oauthCookie.codeVerifier !== "string" ||
    !state.startsWith(`${account.id}:`)
  ) {
    return NextResponse.redirect(new URL("/connected-accounts?x=failed", request.url));
  }

  try {
    await connectXAccount({
      ownerAccountId: account.id,
      code,
      codeVerifier: oauthCookie.codeVerifier
    });
    cookieStore.delete("replypilot_x_oauth");
    return NextResponse.redirect(new URL("/connected-accounts?x=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/connected-accounts?x=failed", request.url));
  }
}

function parseOAuthCookie(value: string | undefined): XOAuthCookie {
  if (!value) return {};

  try {
    return JSON.parse(value) as XOAuthCookie;
  } catch {
    return {};
  }
}
