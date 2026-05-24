import { NextRequest, NextResponse } from "next/server";
import {
  getAppBaseUrl,
  getStripeClient,
  getStripePriceId,
  isPaidPlan,
  stripePlans
} from "@/lib/stripe";
import { getCurrentTrialAccount } from "@/lib/trial-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { plan?: unknown; email?: unknown } | null;
  const plan = body?.plan;

  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Invalid checkout plan." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const priceId = getStripePriceId(plan);

  if (!stripe || !priceId) {
    return NextResponse.json(
      {
        error: `Stripe is not configured yet. Add STRIPE_SECRET_KEY and ${stripePlans[plan].priceEnv} to enable ${stripePlans[plan].name} checkout.`
      },
      { status: 503 }
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const baseUrl = getAppBaseUrl(origin);
  const account = await getCurrentTrialAccount();
  const customerEmail =
    account?.email ?? (typeof body?.email === "string" ? body.email.trim() : undefined);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: customerEmail || undefined,
      allow_promotion_codes: true,
      client_reference_id: account?.id,
      metadata: {
        app: "replypilot_ai",
        plan,
        accountId: account?.id ?? ""
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?plan=${plan}`
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
