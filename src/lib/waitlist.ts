import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export type WaitlistLead = {
  id: string;
  name: string;
  email: string;
  profile_type: "creator" | "agency";
  biggest_pain_point: string;
  plan_interest: "free" | "pro" | "agency" | "beta";
  source: string;
  status: string;
  created_at: string;
};

export type WaitlistSubmissionInput = {
  id: string;
  name: string;
  email: string;
  profile_type: "creator" | "agency";
  biggest_pain_point: string;
  plan_interest: "free" | "pro" | "agency" | "beta";
  source: "replypilot_landing";
  status: "waitlisted";
  created_at: string;
};

export const waitlistDataFile = path.join(
  process.cwd(),
  "data",
  "waitlist-submissions.json"
);

export const mockWaitlistLeads: WaitlistLead[] = [
  {
    id: "mock-1",
    name: "Maya Chen",
    email: "maya@northstarcreators.com",
    profile_type: "agency",
    biggest_pain_point: "Our team spends too much time rewriting safe replies.",
    plan_interest: "agency",
    source: "mock_data",
    status: "waitlisted",
    created_at: "2026-05-20T14:30:00.000Z"
  },
  {
    id: "mock-2",
    name: "Jordan Lee",
    email: "jordan@examplecreator.com",
    profile_type: "creator",
    biggest_pain_point: "I miss high-intent messages when my inbox gets busy.",
    plan_interest: "pro",
    source: "mock_data",
    status: "waitlisted",
    created_at: "2026-05-20T16:15:00.000Z"
  },
  {
    id: "mock-3",
    name: "Sofia Patel",
    email: "sofia@chatopsstudio.com",
    profile_type: "agency",
    biggest_pain_point: "QA review is slow and inconsistent across chatters.",
    plan_interest: "agency",
    source: "mock_data",
    status: "waitlisted",
    created_at: "2026-05-21T09:05:00.000Z"
  }
];

export async function readWaitlistLeads() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("waitlist_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return { leads: mockWaitlistLeads, source: "mock" as const };
    }

    return { leads: data.filter(isWaitlistLead), source: "supabase" as const };
  }

  try {
    const file = await readFile(waitlistDataFile, "utf-8");
    const parsed = JSON.parse(file);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { leads: mockWaitlistLeads, source: "mock" as const };
    }

    return { leads: parsed.filter(isWaitlistLead), source: "local" as const };
  } catch {
    return { leads: mockWaitlistLeads, source: "mock" as const };
  }
}

export async function saveWaitlistLead(submission: WaitlistSubmissionInput) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("waitlist_submissions")
      .insert(submission)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      submission: data ?? submission,
      source: "supabase" as const
    };
  }

  await mkdir(path.dirname(waitlistDataFile), { recursive: true });
  const existing = await readLocalWaitlistLeads();
  existing.push(submission);
  await writeFile(waitlistDataFile, `${JSON.stringify(existing, null, 2)}\n`, "utf-8");

  return {
    submission,
    source: "local" as const
  };
}

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  if (!url.startsWith("https://") || !isUsableSupabaseServerKey(serviceRoleKey)) {
    return null;
  }

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

async function readLocalWaitlistLeads() {
  try {
    const file = await readFile(waitlistDataFile, "utf-8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? (parsed.filter(isWaitlistLead) as WaitlistLead[]) : [];
  } catch {
    return [];
  }
}

function isWaitlistLead(value: unknown): value is WaitlistLead {
  if (!value || typeof value !== "object") return false;
  const lead = value as Record<string, unknown>;

  return (
    typeof lead.id === "string" &&
    typeof lead.name === "string" &&
    typeof lead.email === "string" &&
    (lead.profile_type === "creator" || lead.profile_type === "agency") &&
    typeof lead.biggest_pain_point === "string" &&
    typeof lead.created_at === "string"
  );
}
