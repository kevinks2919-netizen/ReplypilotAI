"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import type { PaidPlan } from "@/lib/stripe";

type CheckoutButtonProps = {
  plan: PaidPlan;
  label: string;
};

export function CheckoutButton({ plan, label }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan })
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout is not available yet.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error ? checkoutError.message : "Checkout is not available yet."
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:bg-ink/45"
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
        {isLoading ? "Opening checkout..." : label}
      </button>
      {error ? (
        <p className="mt-3 rounded-lg border border-coral/20 bg-coral/8 px-3 py-2 text-xs font-semibold leading-5 text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}
