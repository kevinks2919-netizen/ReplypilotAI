import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export type FanMemory = {
  id: string;
  owner_account_id: string;
  provider: "gmail" | "x" | "tiktok" | "onlyfans";
  fan_identifier: string;
  fan_label: string;
  summary: string;
  last_inbound_message: string;
  last_reply_sent: string;
  interaction_count: number;
  created_at: string;
  updated_at: string;
};

const fanMemoriesDataFile = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "data",
  "fan-memories.json"
);

export async function getFanMemory(input: {
  ownerAccountId: string;
  provider: FanMemory["provider"];
  fanIdentifier: string;
}) {
  const normalizedFan = normalizeFanIdentifier(input.fanIdentifier);
  const memories = await readFanMemories();

  return (
    memories.find(
      (memory) =>
        memory.owner_account_id === input.ownerAccountId &&
        memory.provider === input.provider &&
        memory.fan_identifier === normalizedFan
    ) ?? null
  );
}

export async function upsertFanMemory(input: {
  ownerAccountId: string;
  provider: FanMemory["provider"];
  fanIdentifier: string;
  fanLabel: string;
  inboundMessage: string;
  replySent: string;
}) {
  const now = new Date().toISOString();
  const normalizedFan = normalizeFanIdentifier(input.fanIdentifier);
  const existing = await getFanMemory({
    ownerAccountId: input.ownerAccountId,
    provider: input.provider,
    fanIdentifier: normalizedFan
  });
  const inbound = input.inboundMessage.trim();
  const reply = input.replySent.trim();

  const memory: FanMemory = {
    id: existing?.id ?? randomUUID(),
    owner_account_id: input.ownerAccountId,
    provider: input.provider,
    fan_identifier: normalizedFan,
    fan_label: input.fanLabel.trim() || normalizedFan,
    summary: buildUpdatedSummary(existing?.summary ?? "", inbound, reply),
    last_inbound_message: truncate(inbound, 700),
    last_reply_sent: truncate(reply, 700),
    interaction_count: (existing?.interaction_count ?? 0) + 1,
    created_at: existing?.created_at ?? now,
    updated_at: now
  };

  await saveFanMemory(memory);
  return memory;
}

export function formatFanMemoryForPrompt(memory: FanMemory | null) {
  if (!memory) return "";

  return [
    `Fan memory for ${memory.fan_label}:`,
    `Summary: ${memory.summary}`,
    `Previous interactions: ${memory.interaction_count}`,
    `Last inbound message: ${memory.last_inbound_message || "N/A"}`,
    `Last reply sent: ${memory.last_reply_sent || "N/A"}`
  ].join("\n");
}

async function saveFanMemory(memory: FanMemory) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("fan_memories")
      .upsert(memory, { onConflict: "owner_account_id,provider,fan_identifier" });
    if (error) throw new Error(error.message);
    return;
  }

  const memories = await readLocalFanMemories();
  const nextMemories = memories.filter(
    (item) =>
      !(
        item.owner_account_id === memory.owner_account_id &&
        item.provider === memory.provider &&
        item.fan_identifier === memory.fan_identifier
      )
  );
  nextMemories.push(memory);
  await writeLocalFanMemories(nextMemories);
}

async function readFanMemories() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.from("fan_memories").select("*");
    if (error) {
      if (error.message.includes("fan_memories")) return [];
      throw new Error(error.message);
    }
    return Array.isArray(data) ? data.filter(isFanMemory) : [];
  }

  return readLocalFanMemories();
}

async function readLocalFanMemories() {
  try {
    const file = await readFile(fanMemoriesDataFile, "utf-8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed.filter(isFanMemory) as FanMemory[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalFanMemories(memories: FanMemory[]) {
  await mkdir(path.dirname(fanMemoriesDataFile), { recursive: true });
  await writeFile(fanMemoriesDataFile, `${JSON.stringify(memories, null, 2)}\n`, "utf-8");
}

function buildUpdatedSummary(existingSummary: string, inboundMessage: string, replySent: string) {
  const parts = [
    existingSummary.trim(),
    inboundMessage ? `Latest fan message: ${truncate(inboundMessage, 220)}` : "",
    replySent ? `Latest reply sent: ${truncate(replySent, 220)}` : ""
  ].filter(Boolean);

  return truncate(parts.join(" | "), 900);
}

function normalizeFanIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function truncate(value: string, maxLength: number) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 3)}...` : trimmed;
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

function isFanMemory(value: unknown): value is FanMemory {
  if (!value || typeof value !== "object") return false;
  const memory = value as Record<string, unknown>;

  return (
    typeof memory.id === "string" &&
    typeof memory.owner_account_id === "string" &&
    (memory.provider === "gmail" ||
      memory.provider === "x" ||
      memory.provider === "tiktok" ||
      memory.provider === "onlyfans") &&
    typeof memory.fan_identifier === "string" &&
    typeof memory.fan_label === "string" &&
    typeof memory.summary === "string" &&
    typeof memory.last_inbound_message === "string" &&
    typeof memory.last_reply_sent === "string" &&
    typeof memory.interaction_count === "number" &&
    typeof memory.created_at === "string" &&
    typeof memory.updated_at === "string"
  );
}
