"use client";

import { LockKeyhole, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

type AdminLoginFormProps = {
  isConfigured: boolean;
};

export function AdminLoginForm({ isConfigured }: AdminLoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Login failed.");
      }

      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mint/15 text-mint">
        <LockKeyhole size={24} />
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-ink">Admin password required</h1>
      <p className="mt-3 text-sm leading-6 text-ink/64">
        Enter the admin password from your local environment to view waitlist leads.
      </p>

      {!isConfigured ? (
        <p className="mt-5 rounded-lg border border-coral/20 bg-coral/8 px-4 py-3 text-sm leading-6 text-coral">
          Admin password is not configured yet. Set ADMIN_PASSWORD in .env.local and
          restart the app.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
            placeholder="Enter admin password"
            disabled={!isConfigured}
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-coral/20 bg-coral/8 px-4 py-3 text-sm text-coral">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!isConfigured || isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:bg-ink/45"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
          {isSubmitting ? "Checking..." : "Unlock admin"}
        </button>
      </form>
    </section>
  );
}
