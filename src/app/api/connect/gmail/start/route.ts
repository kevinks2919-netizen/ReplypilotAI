import { redirect } from "next/navigation";
import { getGmailAuthorizationUrl } from "@/lib/connected-accounts";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export async function GET() {
  const account = await getCurrentTrialAccount();

  if (!account) {
    redirect("/login");
  }

  redirect(getGmailAuthorizationUrl(account.id));
}
