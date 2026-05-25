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
  const providerError = url.searchParams.get("error");
  const providerErrorDescription = url.searchParams.get("error_description");
  const cookieStore = await cookies();
  const oauthCookie = parseOAuthCookie(cookieStore.get("replypilot_x_oauth")?.value);

  if (!account) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (providerError) {
    console.error("X OAuth provider error", {
      error: providerError,
      description: providerErrorDescription
    });
    return redirectToFailure(request, providerError);
  }

  if (
    !code ||
    !state ||
    state !== oauthCookie.state ||
    typeof oauthCookie.codeVerifier !== "string" ||
    !state.startsWith(`${account.id}:`)
  ) {
    return redirectToFailure(request, "invalid_oauth_session");
  }

  try {
    await connectXAccount({
      ownerAccountId: account.id,
      code,
      codeVerifier: oauthCookie.codeVerifier
    });
    cookieStore.delete("replypilot_x_oauth");
    return NextResponse.redirect(new URL("/connected-accounts?x=connected", request.url));
  } catch (error) {
    console.error("X OAuth connection failed", {
      reason: error instanceof Error ? error.message : "Unknown X OAuth error"
    });
    return redirectToFailure(
      request,
      error instanceof Error ? getFailureReason(error.message) : "unknown"
    );
  }
}

function redirectToFailure(request: NextRequest, reason: string) {
  const redirectUrl = new URL("/connected-accounts", request.url);
  redirectUrl.searchParams.set("x", "failed");
  redirectUrl.searchParams.set("reason", sanitizeReason(reason));
  return NextResponse.redirect(redirectUrl);
}

function getFailureReason(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("refresh token missing") || normalized.includes("offline.access")) {
    return "offline_access_missing";
  }

  if (
    normalized.includes("invalid_client") ||
    normalized.includes("unauthorized_client") ||
    normalized.includes("client authentication")
  ) {
    return "client_credentials";
  }

  if (
    normalized.includes("invalid_grant") ||
    normalized.includes("redirect_uri") ||
    normalized.includes("callback")
  ) {
    return "callback_or_expired_code";
  }

  if (normalized.includes("insufficient") || normalized.includes("forbidden") || normalized.includes("403")) {
    return "x_access";
  }

  return "token_exchange";
}

function sanitizeReason(reason: string) {
  const normalized = reason.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 80);
  return normalized || "unknown";
}

function parseOAuthCookie(value: string | undefined): XOAuthCookie {
  if (!value) return {};

  try {
    return JSON.parse(value) as XOAuthCookie;
  } catch {
    return {};
  }
}
