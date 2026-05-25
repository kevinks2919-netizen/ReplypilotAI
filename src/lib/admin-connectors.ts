import { createClient } from "@supabase/supabase-js";

export type AdminConnectorRow = {
  id: string;
  platform: "gmail" | "x" | "tiktok" | "onlyfans";
  account: string;
  status: string;
  owner_account_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AdminConnectorSource = "supabase" | "empty";

export async function readAdminConnectors() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { connectors: [], source: "empty" as const };
  }

  const [gmail, x, tiktok, onlyfans] = await Promise.all([
    readGmailConnectors(supabase),
    readXConnectors(supabase),
    readTikTokRequests(supabase),
    readOnlyFansRequests(supabase)
  ]);

  const connectors = [...gmail, ...x, ...tiktok, ...onlyfans].sort(
    (first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime()
  );

  return { connectors, source: "supabase" as const };
}

async function readGmailConnectors(supabase: SupabaseAdminClient) {
  const { data, error } = await supabase
    .from("connected_accounts")
    .select("id, owner_account_id, provider_email, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return [];

  return Array.isArray(data)
    ? data
        .filter(isGmailConnector)
        .map((account): AdminConnectorRow => ({
          id: account.id,
          platform: "gmail",
          account: account.provider_email,
          status: account.status,
          owner_account_id: account.owner_account_id,
          notes: "Connected Gmail inbox",
          created_at: account.created_at,
          updated_at: account.updated_at
        }))
    : [];
}

async function readXConnectors(supabase: SupabaseAdminClient) {
  const { data, error } = await supabase
    .from("x_connected_accounts")
    .select("id, owner_account_id, username, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return [];

  return Array.isArray(data)
    ? data
        .filter(isXConnector)
        .map((account): AdminConnectorRow => ({
          id: account.id,
          platform: "x",
          account: `@${account.username}`,
          status: account.status,
          owner_account_id: account.owner_account_id,
          notes: "Connected X account",
          created_at: account.created_at,
          updated_at: account.updated_at
        }))
    : [];
}

async function readTikTokRequests(supabase: SupabaseAdminClient) {
  const { data, error } = await supabase
    .from("tiktok_connection_requests")
    .select("id, owner_account_id, tiktok_handle, account_type, status, notes, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return [];

  return Array.isArray(data)
    ? data
        .filter(isTikTokRequest)
        .map((request): AdminConnectorRow => ({
          id: request.id,
          platform: "tiktok",
          account: `@${request.tiktok_handle}`,
          status: request.status,
          owner_account_id: request.owner_account_id,
          notes: request.notes || request.account_type,
          created_at: request.created_at,
          updated_at: request.updated_at
        }))
    : [];
}

async function readOnlyFansRequests(supabase: SupabaseAdminClient) {
  const { data, error } = await supabase
    .from("onlyfans_connection_requests")
    .select("id, owner_account_id, onlyfans_handle, account_type, status, notes, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return [];

  return Array.isArray(data)
    ? data
        .filter(isOnlyFansRequest)
        .map((request): AdminConnectorRow => ({
          id: request.id,
          platform: "onlyfans",
          account: `@${request.onlyfans_handle}`,
          status: request.status,
          owner_account_id: request.owner_account_id,
          notes: request.notes || request.account_type,
          created_at: request.created_at,
          updated_at: request.updated_at
        }))
    : [];
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

type SupabaseAdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

type UnknownRecord = Record<string, unknown>;

function hasBaseConnectorFields(value: unknown): value is UnknownRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as UnknownRecord;

  return (
    typeof record.id === "string" &&
    typeof record.owner_account_id === "string" &&
    typeof record.status === "string" &&
    typeof record.created_at === "string" &&
    typeof record.updated_at === "string"
  );
}

function isGmailConnector(value: unknown) {
  return hasBaseConnectorFields(value) && typeof value.provider_email === "string";
}

function isXConnector(value: unknown) {
  return hasBaseConnectorFields(value) && typeof value.username === "string";
}

function isTikTokRequest(value: unknown) {
  return (
    hasBaseConnectorFields(value) &&
    typeof value.tiktok_handle === "string" &&
    typeof value.account_type === "string" &&
    typeof value.notes === "string"
  );
}

function isOnlyFansRequest(value: unknown) {
  return (
    hasBaseConnectorFields(value) &&
    typeof value.onlyfans_handle === "string" &&
    typeof value.account_type === "string" &&
    typeof value.notes === "string"
  );
}
