"use client";

import NavBar from "@/components/NavBar";
import { useLeaderboard } from "@/lib/api/userHooks";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="h-6 w-6 bg-[var(--border-color)] rounded-full" />
      <div className="h-4 bg-[var(--border-color)] rounded w-28" />
      <div className="h-4 bg-[var(--border-color)] rounded w-16 ml-auto" />
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: entries, error, isLoading } = useLeaderboard();

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted text-sm mb-6">Top predictors ranked by wins and profit.</p>

        {/* Loading */}
        {isLoading && (
          <div className="card">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-6 text-center">
            <p className="text-[var(--no-color)] mb-2">Failed to load leaderboard</p>
            <p className="text-sm text-muted">Check that the Oracle service is running.</p>
          </div>
        )}

        {/* Leaderboard Table */}
        {entries && entries.length > 0 && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-xs text-muted uppercase tracking-wider">
                  <th className="text-left p-4 w-12">#</th>
                  <th className="text-left p-4">Address</th>
                  <th className="text-center p-4">Wins / Total</th>
                  <th className="text-right p-4">Profit</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const profit = parseFloat(entry.totalProfit);
                  return (
                    <tr key={entry.address} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          i === 0 ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                            : i === 1 ? "bg-[var(--foreground)]/8 text-[var(--foreground)]"
                              : i === 2 ? "bg-[var(--no-color)]/10 text-[var(--no-color)]"
                                : "text-muted"
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm">{truncateAddress(entry.address)}</td>
                      <td className="p-4 text-center font-mono">
                        <span className="text-[var(--yes-color)] font-bold">{entry.wins}</span>
                        <span className="text-muted"> / {entry.totalBets}</span>
                      </td>
                      <td className={`p-4 text-right font-mono font-bold ${
                        profit >= 0 ? "text-[var(--yes-color)]" : "text-[var(--no-color)]"
                      }`}>
                        {profit > 0 ? "+" : ""}{entry.totalProfit} PLAY
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && entries && entries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-lg font-semibold mb-2">No Rankings Yet</h2>
            <p className="text-muted">The leaderboard will populate once markets resolve and bets are settled.</p>
          </div>
        )}
      </div>
    </main>
  );
}
