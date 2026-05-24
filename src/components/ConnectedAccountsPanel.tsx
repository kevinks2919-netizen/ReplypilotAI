"use client";

import { Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { GmailMessagePreview, PublicConnectedAccount } from "@/lib/connected-accounts";
import type { PublicTrialAccount } from "@/lib/trial-auth";

type GmailMessagesResponse = {
  connectedAccounts: PublicConnectedAccount[];
  messages: GmailMessagePreview[];
  error?: string;
};

export function ConnectedAccountsPanel({ account }: { account: PublicTrialAccount | null }) {
  const [connectedAccounts, setConnectedAccounts] = useState<PublicConnectedAccount[]>([]);
  const [messages, setMessages] = useState<GmailMessagePreview[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSender, setPendingSender] = useState("");

  const gmailAccount = connectedAccounts.find((item) => item.provider === "gmail");

  useEffect(() => {
    if (account) {
      loadMessages();
    }
  }, [account]);

  async function loadMessages() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/connect/gmail/messages");
      const payload = (await response.json()) as GmailMessagesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load Gmail messages.");
      }

      setConnectedAccounts(payload.connectedAccounts);
      setMessages(payload.messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load Gmail messages.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateAutoReplyApproval(message: GmailMessagePreview, action: "approve" | "pause") {
    setPendingSender(message.fromEmail);
    setError("");

    try {
      const response = await fetch("/api/connect/auto-reply-approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider: "gmail",
          senderIdentifier: message.fromEmail,
          senderLabel: message.from,
          action
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not update approval.");
      }

      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item.fromEmail === message.fromEmail
            ? { ...item, autoReplyApproved: action === "approve" }
            : item
        )
      );
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Could not update approval.");
    } finally {
      setPendingSender("");
    }
  }

  if (!account) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
        <Mail className="text-coral" size={24} />
        <h2 className="mt-4 text-xl font-semibold text-ink">Login required</h2>
        <p className="mt-2 text-sm leading-6 text-ink/64">
          Create a client login before connecting an email inbox.
        </p>
        <a
          href="/login"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum"
        >
          Log in to connect
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">
            <ShieldCheck size={16} />
            Email connector
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Gmail inbox preview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/64">
            Connect Gmail with Google OAuth to preview recent inbox messages. ReplyPilot AI
            keeps sending human-reviewed by default. Automatic replies are allowed only for
            specific senders the client approves below.
          </p>
        </div>
        <a
          href="/api/connect/gmail/start"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum"
        >
          <Mail size={16} />
          {gmailAccount ? "Reconnect Gmail" : "Connect Gmail"}
        </a>
      </div>

      <div className="mt-5 rounded-lg bg-mist p-4 text-sm leading-6 text-ink/68">
        {gmailAccount ? (
          <>
            Connected Gmail: <span className="font-semibold text-ink">{gmailAccount.provider_email}</span>
          </>
        ) : (
          "No Gmail account connected yet."
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-ink">Recent messages</h3>
        <button
          type="button"
          onClick={loadMessages}
          disabled={isLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-coral/20 bg-coral/8 p-4 text-sm text-coral">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {isLoading ? (
          [0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-ink/10 bg-mist/55 p-4">
              <div className="h-4 w-44 animate-pulse rounded bg-ink/10" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-ink/10" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-ink/10" />
            </div>
          ))
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <article key={message.id} className="rounded-lg border border-ink/10 bg-white p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{message.subject}</p>
                  <p className="mt-1 text-xs text-ink/52">{message.from}</p>
                </div>
                <p className="text-xs text-ink/45">{message.date}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/64">{message.snippet}</p>
              <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg bg-mist p-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                    Auto-reply permission
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {message.autoReplyApproved ? "Approved for this sender" : "Manual review only"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateAutoReplyApproval(
                      message,
                      message.autoReplyApproved ? "pause" : "approve"
                    )
                  }
                  disabled={pendingSender === message.fromEmail}
                  className={`inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    message.autoReplyApproved
                      ? "border border-ink/10 bg-white text-ink hover:border-coral hover:text-coral"
                      : "bg-ink text-white hover:bg-plum"
                  }`}
                >
                  {pendingSender === message.fromEmail
                    ? "Updating..."
                    : message.autoReplyApproved
                      ? "Pause auto-reply"
                      : "Approve auto-reply"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg bg-mist p-4 text-sm text-ink/60">
            No recent Gmail messages loaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
