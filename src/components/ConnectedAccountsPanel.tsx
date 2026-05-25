"use client";

import { Copy, Loader2, Mail, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { GmailMessagePreview, PublicConnectedAccount } from "@/lib/connected-accounts";
import type { SpendingPotential } from "@/lib/mock-ai";
import type { PublicTrialAccount } from "@/lib/trial-auth";

type GmailMessagesResponse = {
  connectedAccounts: PublicConnectedAccount[];
  messages: GmailMessagePreview[];
  error?: string;
};

type GeneratedReplySet = {
  replies: string[];
  fanMood: string;
  urgencyScore: number;
  spendingPotential: SpendingPotential;
  source?: "mock" | "openai";
  error?: string;
};

export function ConnectedAccountsPanel({ account }: { account: PublicTrialAccount | null }) {
  const [connectedAccounts, setConnectedAccounts] = useState<PublicConnectedAccount[]>([]);
  const [messages, setMessages] = useState<GmailMessagePreview[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, GeneratedReplySet>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSender, setPendingSender] = useState("");
  const [generatingMessageId, setGeneratingMessageId] = useState("");
  const [copiedReplyId, setCopiedReplyId] = useState("");
  const [sendingReplyId, setSendingReplyId] = useState("");
  const [sentReplyId, setSentReplyId] = useState("");

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

  async function generateRepliesForMessage(message: GmailMessagePreview) {
    if (!message.autoReplyApproved) {
      setError("Approve this sender before generating auto-reply options.");
      return;
    }

    setGeneratingMessageId(message.id);
    setError("");

    try {
      const response = await fetch("/api/generate-replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tone: "professional",
          message: `From: ${message.from}\nSubject: ${message.subject}\nMessage preview: ${message.snippet}`
        })
      });
      const payload = (await response.json()) as GeneratedReplySet;

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not generate replies.");
      }

      setReplyDrafts((currentDrafts) => ({
        ...currentDrafts,
        [message.id]: payload
      }));
      setSentReplyId("");
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Could not generate replies.");
    } finally {
      setGeneratingMessageId("");
    }
  }

  function updateReplyDraft(messageId: string, index: number, value: string) {
    setReplyDrafts((currentDrafts) => {
      const draft = currentDrafts[messageId];
      if (!draft) return currentDrafts;

      return {
        ...currentDrafts,
        [messageId]: {
          ...draft,
          replies: draft.replies.map((reply, replyIndex) =>
            replyIndex === index ? value : reply
          )
        }
      };
    });
  }

  async function copyReply(replyId: string, reply: string) {
    await navigator.clipboard.writeText(reply);
    setCopiedReplyId(replyId);
  }

  async function sendReply(message: GmailMessagePreview, replyId: string, reply: string) {
    const confirmed = window.confirm(
      `Send this reply to ${message.fromEmail}? Review the text carefully before confirming.`
    );

    if (!confirmed) return;

    setSendingReplyId(replyId);
    setError("");

    try {
      const response = await fetch("/api/connect/gmail/send-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          threadId: message.threadId,
          to: message.fromEmail,
          subject: message.subject,
          body: reply
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not send reply.");
      }

      setSentReplyId(replyId);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send reply.");
    } finally {
      setSendingReplyId("");
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

              {message.autoReplyApproved ? (
                <div className="mt-4 rounded-lg border border-mint/20 bg-mint/10 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-ink">Reply options</p>
                      <p className="mt-1 text-xs text-ink/55">
                        Approved sender. Generate safe draft replies before sending manually.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => generateRepliesForMessage(message)}
                      disabled={generatingMessageId === message.id}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {generatingMessageId === message.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                      {generatingMessageId === message.id ? "Generating..." : "Generate replies"}
                    </button>
                  </div>

                  {replyDrafts[message.id] ? (
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-lg border border-ink/10 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                          Mood detection before sending
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-mist p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                              Fan mood
                            </p>
                            <p className="mt-1 text-sm font-semibold capitalize text-ink">
                              {replyDrafts[message.id].fanMood}
                            </p>
                          </div>
                          <div className="rounded-lg bg-mist p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                              Urgency
                            </p>
                            <p className="mt-1 text-sm font-semibold text-ink">
                              {replyDrafts[message.id].urgencyScore}/10
                            </p>
                          </div>
                          <div className="rounded-lg bg-mist p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                              Spend potential
                            </p>
                            <p className="mt-1 text-sm font-semibold capitalize text-ink">
                              {replyDrafts[message.id].spendingPotential}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-ink/55">
                          Review these signals and edit the reply before clicking Send.
                        </p>
                      </div>
                      {replyDrafts[message.id].replies.map((reply, index) => {
                        const replyId = `${message.id}-${index}`;

                        return (
                          <div key={replyId} className="rounded-lg bg-white p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-plum">
                                Option {index + 1}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => copyReply(replyId, reply)}
                                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-coral hover:text-coral"
                                >
                                  <Copy size={14} />
                                  {copiedReplyId === replyId ? "Copied" : "Copy"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => sendReply(message, replyId, reply)}
                                  disabled={sendingReplyId === replyId || reply.trim().length === 0}
                                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-plum disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {sendingReplyId === replyId ? (
                                    <Loader2 className="animate-spin" size={14} />
                                  ) : (
                                    <Send size={14} />
                                  )}
                                  {sentReplyId === replyId
                                    ? "Sent"
                                    : sendingReplyId === replyId
                                      ? "Sending..."
                                      : "Send"}
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={reply}
                              onChange={(event) =>
                                updateReplyDraft(message.id, index, event.target.value)
                              }
                              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-ink/10 bg-mist/45 p-3 text-sm leading-6 text-ink/72 outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/15"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
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
