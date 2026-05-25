import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export type ConnectedAccount = {
  id: string;
  owner_account_id: string;
  provider: "gmail";
  provider_email: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scopes: string;
  status: "connected" | "needs_reauth";
  created_at: string;
  updated_at: string;
};

export type PublicConnectedAccount = Pick<
  ConnectedAccount,
  "id" | "provider" | "provider_email" | "status" | "created_at" | "updated_at"
>;

export type GmailMessagePreview = {
  id: string;
  threadId: string;
  from: string;
  fromEmail: string;
  subject: string;
  date: string;
  snippet: string;
  autoReplyApproved: boolean;
};

export type AutoReplyApproval = {
  id: string;
  owner_account_id: string;
  provider: "gmail" | "tiktok";
  sender_identifier: string;
  sender_label: string;
  status: "approved" | "paused";
  created_at: string;
  updated_at: string;
};

export type TikTokConnectionRequest = {
  id: string;
  owner_account_id: string;
  tiktok_handle: string;
  account_type: "creator" | "agency" | "brand";
  requested_capability: "dm_review";
  status: "requested" | "approved" | "blocked";
  notes: string;
  created_at: string;
  updated_at: string;
};

const connectedAccountsDataFile = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "data",
  "connected-accounts.json"
);

const autoReplyApprovalsDataFile = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "data",
  "auto-reply-approvals.json"
);

const tiktokRequestsDataFile = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "data",
  "tiktok-connection-requests.json"
);

const gmailScopes = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send"
];

export function getGmailAuthorizationUrl(ownerAccountId: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Google OAuth is not configured. Add GOOGLE_CLIENT_ID first.");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGmailRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", gmailScopes.join(" "));
  url.searchParams.set("state", ownerAccountId);

  return url.toString();
}

export async function connectGmailAccount(ownerAccountId: string, code: string) {
  const tokenPayload = await exchangeCodeForTokens(code);
  const accessToken = getRequiredString(tokenPayload.access_token, "Google access token missing.");
  const refreshToken = getRequiredString(tokenPayload.refresh_token, "Google refresh token missing.");
  const expiresIn = typeof tokenPayload.expires_in === "number" ? tokenPayload.expires_in : 3600;
  const profile = await fetchGoogleProfile(accessToken);
  const now = new Date();

  const connectedAccount: ConnectedAccount = {
    id: randomUUID(),
    owner_account_id: ownerAccountId,
    provider: "gmail",
    provider_email: profile.email,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    scopes: gmailScopes.join(" "),
    status: "connected",
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  await upsertConnectedAccount(connectedAccount);
  return toPublicConnectedAccount(connectedAccount);
}

export async function getPublicConnectedAccounts(ownerAccountId: string) {
  const accounts = await readConnectedAccounts();
  return accounts
    .filter((account) => account.owner_account_id === ownerAccountId)
    .map(toPublicConnectedAccount);
}

export async function listGmailMessages(ownerAccountId: string) {
  const account = await getGmailAccount(ownerAccountId);
  if (!account) return [];
  const approvals = await getAutoReplyApprovals(ownerAccountId);
  const approvedSenders = new Set(
    approvals
      .filter((approval) => approval.provider === "gmail" && approval.status === "approved")
      .map((approval) => approval.sender_identifier.toLowerCase())
  );

  const freshAccount = await refreshGmailAccountIfNeeded(account);
  const listResponse = await gmailFetch<{ messages?: { id: string; threadId: string }[] }>(
    freshAccount,
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=newer_than:30d"
  );

  const messages = listResponse.messages ?? [];
  const previews: GmailMessagePreview[] = [];

  for (const message of messages.slice(0, 10)) {
    const detail = await gmailFetch<GmailMessageDetail>(
      freshAccount,
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
    );
    previews.push(toMessagePreview(detail, approvedSenders));
  }

  return previews;
}

export async function sendGmailReply(input: {
  ownerAccountId: string;
  threadId: string;
  to: string;
  subject: string;
  body: string;
}) {
  const account = await getGmailAccount(input.ownerAccountId);

  if (!account) {
    throw new Error("Connect Gmail before sending replies.");
  }

  const approvals = await getAutoReplyApprovals(input.ownerAccountId);
  const isApproved = approvals.some(
    (approval) =>
      approval.provider === "gmail" &&
      approval.status === "approved" &&
      approval.sender_identifier.toLowerCase() === input.to.trim().toLowerCase()
  );

  if (!isApproved) {
    throw new Error("This sender is not approved for ReplyPilot sending.");
  }

  const freshAccount = await refreshGmailAccountIfNeeded(account);
  const subject = input.subject.toLowerCase().startsWith("re:")
    ? input.subject
    : `Re: ${input.subject}`;
  const rawMessage = [
    `To: ${input.to}`,
    `From: ${freshAccount.provider_email}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.body
  ].join("\r\n");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${freshAccount.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      raw: toBase64Url(rawMessage),
      threadId: input.threadId
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as { id: string; threadId: string };
}

export async function getAutoReplyApprovals(ownerAccountId: string) {
  const approvals = await readAutoReplyApprovals();
  return approvals.filter((approval) => approval.owner_account_id === ownerAccountId);
}

export async function approveAutoReplySender(input: {
  ownerAccountId: string;
  provider: "gmail" | "tiktok";
  senderIdentifier: string;
  senderLabel: string;
}) {
  const now = new Date().toISOString();
  const normalizedSender = input.senderIdentifier.trim().toLowerCase();
  const approvals = await readAutoReplyApprovals();
  const existing = approvals.find(
    (approval) =>
      approval.owner_account_id === input.ownerAccountId &&
      approval.provider === input.provider &&
      approval.sender_identifier.toLowerCase() === normalizedSender
  );

  const approval: AutoReplyApproval = {
    id: existing?.id ?? randomUUID(),
    owner_account_id: input.ownerAccountId,
    provider: input.provider,
    sender_identifier: normalizedSender,
    sender_label: input.senderLabel.trim() || normalizedSender,
    status: "approved",
    created_at: existing?.created_at ?? now,
    updated_at: now
  };

  await upsertAutoReplyApproval(approval);
  return approval;
}

export async function pauseAutoReplySender(input: {
  ownerAccountId: string;
  provider: "gmail" | "tiktok";
  senderIdentifier: string;
}) {
  const normalizedSender = input.senderIdentifier.trim().toLowerCase();
  const approvals = await readAutoReplyApprovals();
  const existing = approvals.find(
    (approval) =>
      approval.owner_account_id === input.ownerAccountId &&
      approval.provider === input.provider &&
      approval.sender_identifier.toLowerCase() === normalizedSender
  );

  if (!existing) return null;

  const updated: AutoReplyApproval = {
    ...existing,
    status: "paused",
    updated_at: new Date().toISOString()
  };

  await upsertAutoReplyApproval(updated);
  return updated;
}

export async function getTikTokConnectionRequests(ownerAccountId: string) {
  const requests = await readTikTokConnectionRequests();
  return requests.filter((request) => request.owner_account_id === ownerAccountId);
}

export async function requestTikTokConnection(input: {
  ownerAccountId: string;
  tiktokHandle: string;
  accountType: "creator" | "agency" | "brand";
  notes: string;
}) {
  const now = new Date().toISOString();
  const normalizedHandle = normalizeTikTokHandle(input.tiktokHandle);

  if (!normalizedHandle) {
    throw new Error("TikTok handle is required.");
  }

  const existingRequests = await readTikTokConnectionRequests();
  const existing = existingRequests.find(
    (request) =>
      request.owner_account_id === input.ownerAccountId &&
      request.tiktok_handle.toLowerCase() === normalizedHandle.toLowerCase()
  );

  const request: TikTokConnectionRequest = {
    id: existing?.id ?? randomUUID(),
    owner_account_id: input.ownerAccountId,
    tiktok_handle: normalizedHandle,
    account_type: input.accountType,
    requested_capability: "dm_review",
    status: existing?.status ?? "requested",
    notes: input.notes.trim(),
    created_at: existing?.created_at ?? now,
    updated_at: now
  };

  await upsertTikTokConnectionRequest(request);
  return request;
}

function getGmailRedirectUri() {
  const configured = process.env.GOOGLE_REDIRECT_URI;
  if (configured) return configured;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/connect/gmail/callback`;
}

async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGmailRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as Record<string, unknown>;
}

async function refreshGmailAccountIfNeeded(account: ConnectedAccount) {
  if (new Date(account.expires_at).getTime() > Date.now() + 60000) {
    return account;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: account.refresh_token,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    await updateConnectedAccount({ ...account, status: "needs_reauth", updated_at: new Date().toISOString() });
    throw new Error("Gmail needs to be reconnected.");
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const accessToken = getRequiredString(payload.access_token, "Google access token missing.");
  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : 3600;
  const updated = {
    ...account,
    access_token: accessToken,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    status: "connected" as const,
    updated_at: new Date().toISOString()
  };

  await updateConnectedAccount(updated);
  return updated;
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Could not read connected Google profile.");
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return {
    email: getRequiredString(payload.email, "Google profile email missing.")
  };
}

async function gmailFetch<T>(account: ConnectedAccount, url: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${account.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T;
}

async function getGmailAccount(ownerAccountId: string) {
  const accounts = await readConnectedAccounts();
  return (
    accounts.find(
      (account) => account.owner_account_id === ownerAccountId && account.provider === "gmail"
    ) ?? null
  );
}

async function upsertConnectedAccount(account: ConnectedAccount) {
  const accounts = await readConnectedAccounts();
  const existing = accounts.find(
    (item) => item.owner_account_id === account.owner_account_id && item.provider === account.provider
  );

  if (existing) {
    await updateConnectedAccount({
      ...account,
      id: existing.id,
      created_at: existing.created_at
    });
    return;
  }

  await saveConnectedAccount(account);
}

async function saveConnectedAccount(account: ConnectedAccount) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase.from("connected_accounts").insert(account);
    if (error) throw new Error(error.message);
    return;
  }

  const accounts = await readLocalConnectedAccounts();
  accounts.push(account);
  await writeLocalConnectedAccounts(accounts);
}

async function updateConnectedAccount(account: ConnectedAccount) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("connected_accounts")
      .upsert(account, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return;
  }

  const accounts = await readLocalConnectedAccounts();
  await writeLocalConnectedAccounts(accounts.map((item) => (item.id === account.id ? account : item)));
}

async function readConnectedAccounts() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.from("connected_accounts").select("*");
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.filter(isConnectedAccount) : [];
  }

  return readLocalConnectedAccounts();
}

async function upsertAutoReplyApproval(approval: AutoReplyApproval) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("auto_reply_approvals")
      .upsert(approval, { onConflict: "owner_account_id,provider,sender_identifier" });
    if (error) throw new Error(error.message);
    return;
  }

  const approvals = await readLocalAutoReplyApprovals();
  const nextApprovals = approvals.filter(
    (item) =>
      !(
        item.owner_account_id === approval.owner_account_id &&
        item.provider === approval.provider &&
        item.sender_identifier.toLowerCase() === approval.sender_identifier.toLowerCase()
      )
  );
  nextApprovals.push(approval);
  await writeLocalAutoReplyApprovals(nextApprovals);
}

async function readAutoReplyApprovals() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.from("auto_reply_approvals").select("*");
    if (error) {
      if (error.message.includes("auto_reply_approvals")) return [];
      throw new Error(error.message);
    }
    return Array.isArray(data) ? data.filter(isAutoReplyApproval) : [];
  }

  return readLocalAutoReplyApprovals();
}

async function upsertTikTokConnectionRequest(request: TikTokConnectionRequest) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("tiktok_connection_requests")
      .upsert(request, { onConflict: "owner_account_id,tiktok_handle" });
    if (error) throw new Error(error.message);
    return;
  }

  const requests = await readLocalTikTokConnectionRequests();
  const nextRequests = requests.filter(
    (item) =>
      !(
        item.owner_account_id === request.owner_account_id &&
        item.tiktok_handle.toLowerCase() === request.tiktok_handle.toLowerCase()
      )
  );
  nextRequests.push(request);
  await writeLocalTikTokConnectionRequests(nextRequests);
}

async function readTikTokConnectionRequests() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.from("tiktok_connection_requests").select("*");
    if (error) {
      if (error.message.includes("tiktok_connection_requests")) return [];
      throw new Error(error.message);
    }
    return Array.isArray(data) ? data.filter(isTikTokConnectionRequest) : [];
  }

  return readLocalTikTokConnectionRequests();
}

async function readLocalTikTokConnectionRequests() {
  try {
    const file = await readFile(tiktokRequestsDataFile, "utf-8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed)
      ? (parsed.filter(isTikTokConnectionRequest) as TikTokConnectionRequest[])
      : [];
  } catch {
    return [];
  }
}

async function writeLocalTikTokConnectionRequests(requests: TikTokConnectionRequest[]) {
  await mkdir(path.dirname(tiktokRequestsDataFile), { recursive: true });
  await writeFile(tiktokRequestsDataFile, `${JSON.stringify(requests, null, 2)}\n`, "utf-8");
}

async function readLocalAutoReplyApprovals() {
  try {
    const file = await readFile(autoReplyApprovalsDataFile, "utf-8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed.filter(isAutoReplyApproval) as AutoReplyApproval[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalAutoReplyApprovals(approvals: AutoReplyApproval[]) {
  await mkdir(path.dirname(autoReplyApprovalsDataFile), { recursive: true });
  await writeFile(autoReplyApprovalsDataFile, `${JSON.stringify(approvals, null, 2)}\n`, "utf-8");
}

async function readLocalConnectedAccounts() {
  try {
    const file = await readFile(connectedAccountsDataFile, "utf-8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed.filter(isConnectedAccount) as ConnectedAccount[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalConnectedAccounts(accounts: ConnectedAccount[]) {
  await mkdir(path.dirname(connectedAccountsDataFile), { recursive: true });
  await writeFile(connectedAccountsDataFile, `${JSON.stringify(accounts, null, 2)}\n`, "utf-8");
}

function toPublicConnectedAccount(account: ConnectedAccount): PublicConnectedAccount {
  return {
    id: account.id,
    provider: account.provider,
    provider_email: account.provider_email,
    status: account.status,
    created_at: account.created_at,
    updated_at: account.updated_at
  };
}

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  if (!url.startsWith("https://") || !isUsableSupabaseServerKey(serviceRoleKey)) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function isUsableSupabaseServerKey(value: string) {
  return value.startsWith("eyJ") || value.startsWith("sb_secret_");
}

function getRequiredString(value: unknown, error: string) {
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(error);
}

type GmailMessageDetail = {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: {
    headers?: { name?: string; value?: string }[];
  };
};

function toMessagePreview(
  message: GmailMessageDetail,
  approvedSenders: Set<string>
): GmailMessagePreview {
  const headers = message.payload?.headers ?? [];
  const from = getHeader(headers, "From");
  const fromEmail = extractEmailAddress(from);

  return {
    id: message.id,
    threadId: message.threadId,
    from,
    fromEmail,
    subject: getHeader(headers, "Subject") || "(No subject)",
    date: getHeader(headers, "Date"),
    snippet: message.snippet ?? "",
    autoReplyApproved: approvedSenders.has(fromEmail.toLowerCase())
  };
}

function getHeader(headers: { name?: string; value?: string }[], name: string) {
  return headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim().toLowerCase();
}

function normalizeTikTokHandle(value: string) {
  return value.trim().replace(/^@+/, "");
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function isConnectedAccount(value: unknown): value is ConnectedAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Record<string, unknown>;

  return (
    typeof account.id === "string" &&
    typeof account.owner_account_id === "string" &&
    account.provider === "gmail" &&
    typeof account.provider_email === "string" &&
    typeof account.access_token === "string" &&
    typeof account.refresh_token === "string" &&
    typeof account.expires_at === "string" &&
    typeof account.scopes === "string" &&
    (account.status === "connected" || account.status === "needs_reauth") &&
    typeof account.created_at === "string" &&
    typeof account.updated_at === "string"
  );
}

function isAutoReplyApproval(value: unknown): value is AutoReplyApproval {
  if (!value || typeof value !== "object") return false;
  const approval = value as Record<string, unknown>;

  return (
    typeof approval.id === "string" &&
    typeof approval.owner_account_id === "string" &&
    (approval.provider === "gmail" || approval.provider === "tiktok") &&
    typeof approval.sender_identifier === "string" &&
    typeof approval.sender_label === "string" &&
    (approval.status === "approved" || approval.status === "paused") &&
    typeof approval.created_at === "string" &&
    typeof approval.updated_at === "string"
  );
}

function isTikTokConnectionRequest(value: unknown): value is TikTokConnectionRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Record<string, unknown>;

  return (
    typeof request.id === "string" &&
    typeof request.owner_account_id === "string" &&
    typeof request.tiktok_handle === "string" &&
    (request.account_type === "creator" ||
      request.account_type === "agency" ||
      request.account_type === "brand") &&
    request.requested_capability === "dm_review" &&
    (request.status === "requested" ||
      request.status === "approved" ||
      request.status === "blocked") &&
    typeof request.notes === "string" &&
    typeof request.created_at === "string" &&
    typeof request.updated_at === "string"
  );
}
