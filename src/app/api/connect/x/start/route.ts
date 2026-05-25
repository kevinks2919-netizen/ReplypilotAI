import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createXAuthorizationRequest } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export async function GET() {
  const account = await getCurrentTrialAccount().catch(() => null);

  if (!account) {
    redirect("/login");
  }

  let authorizationRequest: ReturnType<typeof createXAuthorizationRequest>;

  try {
    authorizationRequest = createXAuthorizationRequest(account.id);
  } catch {
    redirect("/connected-accounts?x=not_configured");
  }

  const cookieStore = await cookies();
  cookieStore.set("replypilot_x_oauth", JSON.stringify({
    codeVerifier: authorizationRequest.codeVerifier,
    state: authorizationRequest.state
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/"
  });

  redirect(authorizationRequest.authorizationUrl);
}
