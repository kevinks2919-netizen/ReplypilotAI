import { redirect } from "next/navigation";
import { getGmailAuthorizationUrl } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export async function GET() {
  const account = await getCurrentTrialAccount().catch(() => null);

  if (!account) {
    redirect("/login");
  }

  try {
    redirect(getGmailAuthorizationUrl(account.id));
  } catch {
    redirect("/connected-accounts?gmail=not_configured");
  }
}
