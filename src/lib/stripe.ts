import Stripe from "stripe";

export type PaidPlan = "pro" | "agency";

export const stripePlans: Record<
  PaidPlan,
  { name: string; priceEnv: string; fallbackPrice: string }
> = {
  pro: {
    name: "Pro",
    priceEnv: "STRIPE_PRO_PRICE_ID",
    fallbackPrice: "$10/month"
  },
  agency: {
    name: "Agency",
    priceEnv: "STRIPE_AGENCY_PRICE_ID",
    fallbackPrice: "$19/month"
  }
};

export function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "pro" || value === "agency";
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia"
  });
}

export function getStripePriceId(plan: PaidPlan) {
  return process.env[stripePlans[plan].priceEnv];
}

export function getAppBaseUrl(requestOrigin: string) {
  return process.env.NEXT_PUBLIC_APP_URL ?? requestOrigin;
}
