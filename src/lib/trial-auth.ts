import { randomBytes, randomUUID, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export type TrialAccount = {
  id: string;
  email: string;
  password_hash: string;
  trial_started_at: string;
  trial_ends_at: string;
  reply_limit: number;
  replies_used: number;
  plan_status: "trial" | "active" | "expired";
  created_at: string;
};

export type PublicTrialAccount = Pick<
  TrialAccount,
  "id" | "email" | "trial_started_at" | "trial_ends_at" | "reply_limit" | "replies_used" | "plan_status"
>;

const sessionCookieName = "replypilot_trial_session";
const trialDays = 14;
const trialReplyLimit = 20;

const accountsDataFile = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "data",
  "trial-accounts.json"
);

export async function createTrialAccount(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findAccountByEmail(normalizedEmail);

  if (existing) {
    throw new Error("An account already exists for this email. Log in instead.");
  }

  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const account: TrialAccount = {
    id: randomUUID(),
    email: normalizedEmail,
    password_hash: hashPassword(password),
    trial_started_at: now.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
    reply_limit: trialReplyLimit,
    replies_used: 0,
    plan_status: "trial",
    created_at: now.toISOString()
  };

  await saveAccount(account);
  await setTrialSession(account.id);
  return toPublicTrialAccount(account);
}

export async function loginTrialAccount(email: string, password: string) {
  const account = await findAccountByEmail(normalizeEmail(email));

  if (!account || !verifyPassword(password, account.password_hash)) {
    throw new Error("Email or password is incorrect.");
  }

  await setTrialSession(account.id);
  return toPublicTrialAccount(account);
}

export async function logoutTrialAccount() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getCurrentTrialAccount() {
  const cookieStore = await cookies();
  const accountId = cookieStore.get(sessionCookieName)?.value;
  if (!accountId) return null;

  const account = await findAccountById(accountId);
  return account ? toPublicTrialAccount(account) : null;
}

export async function requireActiveTrialAccount() {
  const cookieStore = await cookies();
  const accountId = cookieStore.get(sessionCookieName)?.value;

  if (!accountId) {
    return { ok: false as const, status: 401, error: "Log in to use the demo." };
  }

  const account = await findAccountById(accountId);

  if (!account) {
    return { ok: false as const, status: 401, error: "Session expired. Log in again." };
  }

  if (isTrialExpired(account)) {
    await updateAccount({ ...account, plan_status: "expired" });
    return {
      ok: false as const,
      status: 402,
      error: "Your 14-day demo has ended. Choose Pro or Agency to continue."
    };
  }

  if (account.plan_status !== "active" && account.replies_used >= account.reply_limit) {
    return {
      ok: false as const,
      status: 402,
      error: "Your 20 demo replies are used. Choose Pro or Agency to continue."
    };
  }

  return { ok: true as const, account };
}

export async function incrementReplyUsage(account: TrialAccount) {
  const updated = {
    ...account,
    replies_used:
      account.plan_status === "active"
        ? account.replies_used + 1
        : Math.min(account.reply_limit, account.replies_used + 1)
  };

  await updateAccount(updated);
  return toPublicTrialAccount(updated);
}

export async function activateAccountByEmail(email: string) {
  const account = await findAccountByEmail(normalizeEmail(email));

  if (!account) return null;

  const updated = {
    ...account,
    plan_status: "active" as const
  };

  await updateAccount(updated);
  return toPublicTrialAccount(updated);
}

export function toPublicTrialAccount(account: TrialAccount): PublicTrialAccount {
  return {
    id: account.id,
    email: account.email,
    trial_started_at: account.trial_started_at,
    trial_ends_at: account.trial_ends_at,
    reply_limit: account.reply_limit,
    replies_used: account.replies_used,
    plan_status: isTrialExpired(account) ? "expired" : account.plan_status
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `pbkdf2_sha512$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [method, salt, hash] = storedHash.split("$");
  if (method !== "pbkdf2_sha512" || !salt || !hash) return false;

  const candidate = pbkdf2Sync(password, salt, 100000, 64, "sha512");
  const expected = Buffer.from(hash, "hex");

  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

function isTrialExpired(account: TrialAccount) {
  return new Date(account.trial_ends_at).getTime() < Date.now() && account.plan_status !== "active";
}

async function setTrialSession(accountId: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, accountId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * trialDays,
    path: "/"
  });
}

async function findAccountByEmail(email: string) {
  const accounts = await readAccounts();
  return accounts.find((account) => account.email === email) ?? null;
}

async function findAccountById(id: string) {
  const accounts = await readAccounts();
  return accounts.find((account) => account.id === id) ?? null;
}

async function saveAccount(account: TrialAccount) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase.from("trial_accounts").insert(account);
    if (error) throw new Error(error.message);
    return;
  }

  const accounts = await readLocalAccounts();
  accounts.push(account);
  await writeLocalAccounts(accounts);
}

async function updateAccount(account: TrialAccount) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("trial_accounts")
      .update({
        replies_used: account.replies_used,
        plan_status: account.plan_status
      })
      .eq("id", account.id);

    if (error) throw new Error(error.message);
    return;
  }

  const accounts = await readLocalAccounts();
  await writeLocalAccounts(accounts.map((item) => (item.id === account.id ? account : item)));
}

async function readAccounts() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.from("trial_accounts").select("*");
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.filter(isTrialAccount) : [];
  }

  return readLocalAccounts();
}

async function readLocalAccounts() {
  try {
    const file = await readFile(accountsDataFile, "utf-8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed.filter(isTrialAccount) as TrialAccount[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalAccounts(accounts: TrialAccount[]) {
  await mkdir(path.dirname(accountsDataFile), { recursive: true });
  await writeFile(accountsDataFile, `${JSON.stringify(accounts, null, 2)}\n`, "utf-8");
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

function isTrialAccount(value: unknown): value is TrialAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Record<string, unknown>;

  return (
    typeof account.id === "string" &&
    typeof account.email === "string" &&
    typeof account.password_hash === "string" &&
    typeof account.trial_started_at === "string" &&
    typeof account.trial_ends_at === "string" &&
    typeof account.reply_limit === "number" &&
    typeof account.replies_used === "number" &&
    (account.plan_status === "trial" ||
      account.plan_status === "active" ||
      account.plan_status === "expired") &&
    typeof account.created_at === "string"
  );
}
