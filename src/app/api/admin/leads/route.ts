import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { readWaitlistLeads } from "@/lib/waitlist";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();

  if (!isValidAdminToken(cookieStore.get(adminCookieName)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { leads, source } = await readWaitlistLeads();

    return NextResponse.json({
      leads,
      source
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load leads.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
