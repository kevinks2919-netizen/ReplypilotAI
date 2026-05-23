"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

type ProfileType = "creator" | "agency";

function WaitlistFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("agency");
  const [painPoint, setPainPoint] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const planInterest = useMemo(() => searchParams.get("plan") ?? "beta", [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          profileType,
          painPoint,
          planInterest
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not join beta.");
      }

      router.push("/thank-you");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not join beta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="waitlist-name">
            Name
          </label>
          <input
            id="waitlist-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="waitlist-email">
            Email
          </label>
          <input
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink" htmlFor="profile-type">
          I am a
        </label>
        <select
          id="profile-type"
          value={profileType}
          onChange={(event) => setProfileType(event.target.value as ProfileType)}
          className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm capitalize outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
        >
          <option value="agency">Agency</option>
          <option value="creator">Creator</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink" htmlFor="pain-point">
          Biggest pain point
        </label>
        <textarea
          id="pain-point"
          value={painPoint}
          onChange={(event) => setPainPoint(event.target.value)}
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
          placeholder="Example: slow replies, QA risk, missed high-intent messages..."
          required
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-coral/20 bg-coral/8 px-4 py-3 text-sm text-coral">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:bg-ink/45"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
        {isSubmitting ? "Joining..." : "Join Beta"}
      </button>
    </form>
  );
}

export function WaitlistForm() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-mist p-4 text-sm text-ink/64">Loading form...</div>}>
      <WaitlistFormInner />
    </Suspense>
  );
}
