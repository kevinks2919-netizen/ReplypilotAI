import { NextRequest, NextResponse } from "next/server";
import { createTrialAccount } from "@/lib/trial-auth";

type AuthRequest = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as AuthRequest | null;
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const account = await createTrialAccount(email, password);
    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 }
    );
  }
}
