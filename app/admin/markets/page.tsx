"use client";

import { useState } from "react";
import { useAdminMarkets } from "@/lib/api/adminHooks";
import StatusBadge from "@/components/admin/StatusBadge";
import MarketSearch from "@/components/MarketSearch";
import CategoryFilter from "@/components/CategoryFilter";
import StatusTabs from "@/components/StatusTabs";
import Link from "next/link";

const ADMIN_STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "proposed", label: "Proposed" },
  { key: "resolved", label: "Resolved" },
  { key: "expired", label: "Expired" },
  { key: "pending_resolution", label: "Needs Review" },
];

const CATEGORIES = ["all", "sports", "news", "politics", "society", "meta", "economy", "events"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "passed";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AdminMarkets() {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [quickFilter, setQuickFilter] = useState<string | undefined>();
  const limit = 15;

  const params: Record<string, any> = { limit, offset: page * limit };
  if (status !== "all" && !quickFilter) params.status = status;
  if (category !== "all") params.category = category;
  if (search) params.search = search;
  if (quickFilter === "1h") params.expiresWithin = 60;
  if (quickFilter === "24h") params.expiresWithin = 1440;
  if (quickFilter === "resolve") params.status = "pending_resolution";

  const { data, error } = useAdminMarkets(params);

  const handleStatusChange = (v: string) => { setStatus(v); setQuickFilter(undefined); setPage(0); };
  const handleCategoryChange = (v: string) => { setCategory(v); setPage(0); };
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Markets</h1>

      {/* Search */}
      <div className="mb-4">
        <MarketSearch value={search} onChange={handleSearchChange} />
      </div>

      {/* Status Tabs */}
      <div className="mb-4">
        <StatusTabs value={quickFilter ? "" : status} onChange={handleStatusChange} tabs={ADMIN_STATUS_TABS} />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <CategoryFilter value={category} onChange={handleCategoryChange} categories={CATEGORIES} />

        <div className="flex gap-2">
          {[
            { label: "Expiring 1h", key: "1h" },
            { label: "Expiring 24h", key: "24h" },
            { label: "Needs Resolution", key: "resolve" },
          ].map((q) => (
            <button
              key={q.key}
              onClick={() => { setQuickFilter(quickFilter === q.key ? undefined : q.key); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                quickFilter === q.key
                  ? "bg-[var(--no-color)] text-white"
                  : "bg-[var(--foreground)]/5 text-muted hover:bg-[var(--foreground)]/10"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>

        {data && (
          <span className="text-xs text-muted ml-auto">
            {data.total} result{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <div className="text-center py-10 text-[var(--no-color)]">Failed to load markets.</div>
      )}

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="pb-3 font-semibold text-muted text-xs uppercase tracking-wider">Question</th>
                  <th className="pb-3 font-semibold text-muted text-xs uppercase tracking-wider w-24">Category</th>
                  <th className="pb-3 font-semibold text-muted text-xs uppercase tracking-wider w-28">Status</th>
                  <th className="pb-3 font-semibold text-muted text-xs uppercase tracking-wider w-24">Closes In</th>
                  <th className="pb-3 font-semibold text-muted text-xs uppercase tracking-wider w-28">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.markets.map((m: any) => (
                  <tr key={m.id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--foreground)]/3 transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/markets/${m.id}`} className="hover:text-[var(--accent)] transition-colors">
                        {m.question}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-muted">{m.category}</span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-3 font-mono text-xs">
                      {formatRelative(m.bettingClosesAt)}
                    </td>
                    <td className="py-3 text-xs text-muted">
                      {formatDate(m.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.markets.length === 0 && (
            <div className="text-center py-10 text-muted">No markets match your filters.</div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="btn btn-outline text-xs disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-muted">
              Page {page + 1} of {Math.max(1, Math.ceil(data.total / limit))}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.hasMore}
              className="btn btn-outline text-xs disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </>
      )}

      {!data && !error && (
        <div className="text-center py-10 text-muted">Loading...</div>
      )}
    </div>
  );
}
