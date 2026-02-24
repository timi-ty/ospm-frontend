"use client";

import { useAdminStats, useTimeseries, useAdminMarkets, useMarketMaking } from "@/lib/api/adminHooks";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import TimeSeriesChart from "@/components/admin/TimeSeriesChart";
import Spinner from "@/components/ui/Spinner";
import { Check, X } from "lucide-react";
import Link from "next/link";

function formatRelative(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "passed";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AdminOverview() {
  const { data: stats, error: statsError } = useAdminStats();
  const { data: ts } = useTimeseries(14);
  const { data: expiring } = useAdminMarkets({ expiresWithin: 1440, limit: 5 });
  const { data: recent } = useAdminMarkets({ limit: 10 });
  const { data: mm } = useMarketMaking();

  if (statsError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Cannot reach Oracle</h2>
        <p className="text-muted">Make sure the Oracle is running on port 3001.</p>
      </div>
    );
  }

  if (!stats) {
    return <Spinner />;
  }

  const m = stats.markets;
  const s = stats.system;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${s.blockchainConnected ? "bg-[var(--yes-color)]" : "bg-[var(--no-color)]"}`}
          />
          <span className="text-xs text-muted">
            Chain {s.blockchainConnected ? "connected" : "disconnected"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard label="Total Markets" value={m.total} />
        <StatsCard label="Open" value={m.byStatus.open ?? 0} accent />
        <StatsCard label="Pending Deploy" value={m.byStatus.pending ?? 0} />
        <StatsCard label="Proposed" value={m.byStatus.proposed ?? 0} />
        <StatsCard label="Resolved" value={m.byStatus.resolved ?? 0} />
        <StatsCard label="On-Chain" value={m.deployedOnChain} sub={`${m.createdLast24h} new today`} />
      </div>

      {/* Market Making */}
      {mm && (
        <div className="card p-5 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
            Market Making
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <div className="text-xs text-muted">Oracle ETH</div>
              <div className="text-lg font-bold font-mono">{parseFloat(mm.oracleEthBalance).toFixed(4)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Oracle PLAY</div>
              <div className="text-lg font-bold font-mono">{parseFloat(mm.oraclePlayBalance).toFixed(0)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Markets w/ Bets</div>
              <div className="text-lg font-bold font-mono">{mm.marketCount}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Total Collected</div>
              <div className="text-lg font-bold font-mono">{mm.totalCollected.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Max Payout</div>
              <div className="text-lg font-bold font-mono">{mm.maxPotentialPayout.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Net Exposure</div>
              <div className={`text-lg font-bold font-mono ${mm.totalExposure > 0 ? "text-[var(--no-color)]" : "text-[var(--yes-color)]"}`}>
                {mm.totalExposure > 0 ? "+" : ""}{mm.totalExposure.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time-Series Chart */}
      <div className="card p-5 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
          Markets Over Time (14 days)
        </h2>
        {ts ? (
          <TimeSeriesChart data={ts.days} />
        ) : (
          <div className="h-[300px] flex items-center justify-center"><Spinner /></div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
            Expiring Soon (24h)
          </h2>
          {expiring && expiring.markets.length > 0 ? (
            <div className="space-y-3">
              {expiring.markets.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/admin/markets/${m.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
                >
                  <span className="text-sm font-medium truncate max-w-[70%]">{m.question}</span>
                  <span className="text-xs font-mono text-[var(--no-color)] shrink-0">
                    {formatRelative(m.bettingClosesAt)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-4">No markets expiring within 24 hours.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
            Recent Markets
          </h2>
          {recent && recent.markets.length > 0 ? (
            <div className="space-y-2">
              {recent.markets.slice(0, 8).map((m: any) => (
                <Link
                  key={m.id}
                  href={`/admin/markets/${m.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--foreground)]/3 transition-colors"
                >
                  <span className="text-sm truncate max-w-[60%]">{m.question}</span>
                  <StatusBadge status={m.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-4">No markets yet.</p>
          )}
        </div>
      </div>

      {/* System Summary */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--foreground)]/3 flex flex-wrap gap-6 text-xs text-muted">
        <span>Tick #{s.tickCount}</span>
        <span>Wallet: {parseFloat(s.oracleWalletBalance).toFixed(4)} ETH</span>
        <span className="inline-flex items-center gap-1">Data Service: {s.dataServiceHealthy ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}</span>
        <span>Up since: {new Date(s.oracleUpSince).toLocaleString()}</span>
      </div>
    </div>
  );
}
