"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "signup" | "login";

export function TrialLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not continue.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not continue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-mist p-1">
        {(["signup", "login"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setError("");
            }}
            className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition ${
              mode === option ? "bg-white text-ink shadow-sm" : "text-ink/58 hover:text-ink"
            }`}
          >
            {option === "signup" ? "Start trial" : "Log in"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          className="w-full rounded-lg border border-ink/15 bg-mist/60 px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-ink/15 bg-mist/60 px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        {error ? (
          <p className="rounded-lg border border-coral/20 bg-coral/8 px-4 py-3 text-sm text-coral">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:bg-ink/45"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
          {mode === "signup" ? "Start 14-day demo" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-xs leading-5 text-ink/52">
        Trial includes 20 reply generations over 14 days. After the trial or limit,
        upgrade to a monthly plan to continue.
      </p>
    </div>
  );
}
