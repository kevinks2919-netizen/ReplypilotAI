import { NextResponse } from "next/server";
import { logoutTrialAccount } from "@/lib/trial-auth";

export async function POST() {
  await logoutTrialAccount();
  return NextResponse.json({ ok: true });
}
