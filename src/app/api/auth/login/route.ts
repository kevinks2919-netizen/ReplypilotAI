import { NextRequest, NextResponse } from "next/server";
import { loginTrialAccount } from "@/lib/trial-auth";

type AuthRequest = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as AuthRequest | null;
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  try {
    const account = await loginTrialAccount(email, password);
    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not log in." },
      { status: 401 }
    );
  }
}
