"use client";

import { useState, useEffect, useCallback } from "react";
import { useMarkets } from "@/lib/api/hooks";
import MarketCard from "@/components/MarketCard";
import MarketSearch from "@/components/MarketSearch";
import CategoryFilter from "@/components/CategoryFilter";
import StatusTabs from "@/components/StatusTabs";
import NavBar from "@/components/NavBar";
import type { Market } from "@/lib/api/types";

const PUBLIC_STATUS_TABS = [
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

const CATEGORIES = ["all", "sports", "news", "politics", "society", "meta", "economy", "events"];
const PAGE_SIZE = 18;

export default function Home() {
  const [status, setStatus] = useState("open");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);

  const params = {
    status: status === "all" ? undefined : status,
    category: category === "all" ? undefined : category,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, error, isLoading } = useMarkets(params);

  const resetAndSetStatus = useCallback((v: string) => { setStatus(v); setPage(0); setAllMarkets([]); }, []);
  const resetAndSetCategory = useCallback((v: string) => { setCategory(v); setPage(0); setAllMarkets([]); }, []);
  const resetAndSetSearch = useCallback((v: string) => { setSearch(v); setPage(0); setAllMarkets([]); }, []);

  useEffect(() => {
    if (!data) return;
    if (page === 0) {
      setAllMarkets(data.markets);
    } else {
      setAllMarkets((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMarkets = data.markets.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newMarkets];
      });
    }
  }, [data, page]);

  const loadMore = () => setPage((p) => p + 1);

  return (
    <main className="min-h-screen">
      <NavBar />

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <div className="py-12 md:py-20 max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-6">
            Why This Exists
          </h2>
          <h1 className="text-2xl md:text-4xl font-medium leading-tight mb-8 text-foreground/90">
            Prediction markets will have a{" "}
            <span className="text-foreground decoration-2 decoration-[var(--accent)]/30 underline underline-offset-2">
              profound feedback effect
            </span>{" "}
            on decision making — similar to how the stock market influences
            public companies.
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl">
            Leading prediction markets must be{" "}
            <span className="text-[var(--accent)] font-medium">open source</span>{" "}
            to truly democratize the tools that shape our future decisions. This
            is an experiment in that transparency.
          </p>
          <div className="mt-8 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl inline-block text-left w-full sm:w-auto">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 leading-none mt-0.5">✨</span>
              <p className="text-sm text-[var(--foreground)] font-medium leading-snug">
                Markets are AI-generated from real-world news sources,
                identifying upcoming events worth predicting.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <MarketSearch value={search} onChange={resetAndSetSearch} />
          <div className="flex flex-wrap items-center gap-4">
            <StatusTabs value={status} onChange={resetAndSetStatus} tabs={PUBLIC_STATUS_TABS} />
            <CategoryFilter value={category} onChange={resetAndSetCategory} categories={CATEGORIES} />
            {data && (
              <span className="text-xs text-muted ml-auto">
                {data.total} market{data.total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && allMarkets.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-pulse-glow inline-block p-4 rounded-2xl bg-white/80 mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[var(--accent)] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Loading Markets...</h2>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-4">Failed to Load Markets</h2>
            <p className="text-muted mb-6">Could not connect to the Oracle service.</p>
            <code className="block p-4 bg-white rounded-xl text-sm text-[var(--accent)] border border-[var(--border-color)]">
              cd oracle && npm run dev
            </code>
          </div>
        )}

        {/* Markets Grid */}
        {allMarkets.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
            {data?.hasMore && (
              <div className="text-center mt-8">
                <button className="btn btn-outline" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && allMarkets.length === 0 && data && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-semibold mb-2">No Markets Found</h2>
            <p className="text-muted">
              {search ? `No markets match "${search}".` : "Markets will appear once generated."}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-[var(--border-color)] text-center pb-8">
          <p className="text-sm text-muted">
            <a href="https://github.com/timi-ty/ospm-frontend" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
              Built with Next.js
            </a>
            {" · "}
            <a href="https://github.com/timi-ty/ospm-services" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
              Powered by Oracle Service
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
