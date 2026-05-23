"use client";

import { Download, Loader2, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { WaitlistLead } from "@/lib/waitlist";

type LeadsResponse = {
  leads: WaitlistLead[];
  source: "local" | "mock" | "supabase";
};

export function AdminDashboard() {
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [source, setSource] = useState<"local" | "mock" | "supabase">("mock");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch("/api/admin/leads");
        const payload = (await response.json()) as LeadsResponse;

        if (!response.ok) {
          throw new Error("Could not load leads.");
        }

        setLeads(payload.leads);
        setSource(payload.source);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load leads.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLeads();
  }, []);

  const metrics = useMemo(() => {
    const creatorCount = leads.filter((lead) => lead.profile_type === "creator").length;
    const agencyCount = leads.filter((lead) => lead.profile_type === "agency").length;
    const painPoints = getCommonPainPoints(leads);

    return {
      total: leads.length,
      creatorCount,
      agencyCount,
      painPoints
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return leads;

    return leads.filter((lead) => {
      return [
        lead.name,
        lead.email,
        lead.profile_type,
        lead.biggest_pain_point,
        lead.plan_interest,
        formatDate(lead.created_at)
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [leads, searchQuery]);

  function exportCsv() {
    const headers = ["Name", "Email", "Type", "Pain Point", "Plan Interest", "Date"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.profile_type,
      lead.biggest_pain_point,
      lead.plan_interest,
      formatDate(lead.created_at)
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "replypilot-waitlist-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-sm">
              <div className="h-3 w-28 animate-pulse rounded bg-ink/10" />
              <div className="mt-4 h-10 w-16 animate-pulse rounded bg-ink/10" />
            </div>
          ))}
        </section>
        <div className="rounded-lg border border-ink/10 bg-white/88 p-6 text-ink/64">
          <Loader2 className="mb-3 animate-spin text-coral" size={24} />
          Loading waitlist leads...
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-10 animate-pulse rounded-lg bg-ink/8" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-coral/20 bg-coral/8 p-6 text-coral">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total leads" value={metrics.total.toString()} />
        <MetricCard label="Creators" value={metrics.creatorCount.toString()} />
        <MetricCard label="Agencies" value={metrics.agencyCount.toString()} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.6fr_1fr]">
        <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="text-mint" size={20} />
            <h2 className="text-lg font-semibold text-ink">Most common pain points</h2>
          </div>
          <div className="mt-4 space-y-3">
            {metrics.painPoints.length > 0 ? metrics.painPoints.map((painPoint) => (
              <div
                key={painPoint.label}
                className="flex items-center justify-between gap-3 rounded-lg bg-mist px-3 py-3 text-sm"
              >
                <span className="text-ink/72">{painPoint.label}</span>
                <span className="rounded-lg bg-white px-2 py-1 font-semibold text-ink">
                  {painPoint.count}
                </span>
              </div>
            )) : (
              <p className="rounded-lg bg-mist px-3 py-3 text-sm text-ink/60">
                No pain points captured yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-ink">Waitlist leads</h2>
              <p className="mt-1 text-sm text-ink/55">
                Data source: {getSourceLabel(source)}
              </p>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filteredLeads.length === 0}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="lead-search"
              className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 focus-within:border-coral focus-within:ring-4 focus-within:ring-coral/15 sm:max-w-md"
            >
              <Search size={17} className="shrink-0 text-ink/45" />
              <input
                id="lead-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, email, type, pain point..."
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/38"
              />
            </label>
            <p className="text-sm text-ink/55">
              Showing {filteredLeads.length} of {leads.length}
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-[0.12em] text-ink/45">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Pain point</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-ink/8 align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">{lead.name}</td>
                    <td className="py-4 pr-4 text-ink/68">{lead.email}</td>
                    <td className="py-4 pr-4 capitalize text-ink/68">{lead.profile_type}</td>
                    <td className="max-w-sm py-4 pr-4 text-ink/68">
                      {lead.biggest_pain_point}
                    </td>
                    <td className="py-4 pr-4 text-ink/68">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink/58">
                No waitlist leads yet. Submit the homepage beta form to add one.
              </p>
            ) : filteredLeads.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink/58">
                No leads match your search.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function getCommonPainPoints(leads: WaitlistLead[]) {
  const counts = new Map<string, number>();

  for (const lead of leads) {
    const label = normalizePainPoint(lead.biggest_pain_point);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
}

function normalizePainPoint(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "n/a" || normalized === "na") return "Not specified";
  if (normalized.includes("qa") || normalized.includes("review")) return "QA and review";
  if (normalized.includes("slow") || normalized.includes("time")) return "Slow replies";
  if (normalized.includes("intent") || normalized.includes("busy")) return "Missed high-intent messages";
  return value.trim();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function getSourceLabel(source: "local" | "mock" | "supabase") {
  if (source === "supabase") return "Supabase";
  if (source === "local") return "local JSON file";
  return "mock data";
}
