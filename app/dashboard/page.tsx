"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { BarChart3 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { usePlayToken } from "@/hooks/usePlayToken";
import { useUserBets } from "@/lib/api/userHooks";
import type { UserBet } from "@/lib/api/types";

function computeOdds(qYes: number, qNo: number, b: number) {
  if (b === 0) return 50;
  const a = qYes / b;
  const d = qNo / b;
  const m = Math.max(a, d);
  const expA = Math.exp(a - m);
  const expD = Math.exp(d - m);
  return Math.round((expA / (expA + expD)) * 100);
}

function BetCard({ bet }: { bet: UserBet }) {
  const isResolved = bet.market.status === "resolved";
  const won = isResolved && bet.market.resolvedOutcome === bet.outcome;
  const lost = isResolved && bet.market.resolvedOutcome !== bet.outcome;
  const yesPercent = computeOdds(bet.market.qYes, bet.market.qNo, bet.market.b);

  return (
    <Link href={`/markets/${bet.market.id}`} className="block">
      <div className="card hover:border-[var(--border-hover)] transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-sm font-semibold leading-tight line-clamp-2 flex-1">
            {bet.market.question}
          </h4>
          {isResolved && (
            <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
              won
                ? "bg-[var(--yes-color)]/10 text-[var(--yes-color)]"
                : "bg-[var(--no-color)]/10 text-[var(--no-color)]"
            }`}>
              {won ? "WON" : "LOST"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted">Side</div>
            <div className={`font-bold ${bet.outcome ? "text-[var(--yes-color)]" : "text-[var(--no-color)]"}`}>
              {bet.outcome ? "YES" : "NO"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Shares</div>
            <div className="font-bold font-mono">{bet.shares.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Cost</div>
            <div className="font-bold font-mono">{bet.costBasis.toFixed(1)}</div>
          </div>
        </div>

        {!isResolved && (
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex justify-between text-xs text-muted">
            <span>Current odds: {yesPercent}% YES</span>
            <span className="capitalize">{bet.market.status}</span>
          </div>
        )}

        {won && !bet.claimed && (
          <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
            <div className="text-xs font-medium text-[var(--yes-color)]">
              Payout: {bet.shares.toFixed(1)} PLAY — Claim winnings on market page
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-[var(--border-color)] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[var(--border-color)] rounded w-1/2 mb-4" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-8 bg-[var(--border-color)] rounded" />
        <div className="h-8 bg-[var(--border-color)] rounded" />
        <div className="h-8 bg-[var(--border-color)] rounded" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const { address, getAccessToken } = useAuth();
  const { balance } = usePlayToken();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getAccessToken().then(setToken);
  }, [getAccessToken]);

  const { data: bets, error, isLoading } = useUserBets(address, token);

  const activeBets = bets?.filter((b) => !["resolved", "expired"].includes(b.market.status)) ?? [];
  const resolvedBets = bets?.filter((b) => b.market.status === "resolved") ?? [];
  const wins = resolvedBets.filter((b) => b.market.resolvedOutcome === b.outcome).length;
  const losses = resolvedBets.filter((b) => b.market.resolvedOutcome !== b.outcome).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold font-mono">{parseFloat(balance || "0").toFixed(0)}</div>
          <div className="text-xs text-muted uppercase tracking-wider mt-1">$PLAY</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold font-mono">{activeBets.length}</div>
          <div className="text-xs text-muted uppercase tracking-wider mt-1">Active Bets</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold font-mono">{wins}/{losses}</div>
          <div className="text-xs text-muted uppercase tracking-wider mt-1">Won / Lost</div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-6 text-center">
          <p className="text-[var(--no-color)] mb-2">Failed to load bets</p>
          <p className="text-sm text-muted">Check that the Oracle service is running.</p>
        </div>
      )}

      {/* Active Bets */}
      {activeBets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Active Bets</h2>
          <div className="space-y-3">
            {activeBets.map((bet) => <BetCard key={bet.id} bet={bet} />)}
          </div>
        </section>
      )}

      {/* Resolved Bets */}
      {resolvedBets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Resolved Bets</h2>
          <div className="space-y-3">
            {resolvedBets.map((bet) => <BetCard key={bet.id} bet={bet} />)}
          </div>
        </section>
      )}

      {/* Bet History Table */}
      {bets && bets.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Bet History</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-xs text-muted uppercase tracking-wider">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Market</th>
                  <th className="text-center p-3">Side</th>
                  <th className="text-right p-3">Cost</th>
                  <th className="text-right p-3">P&L</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => {
                  const isResolved = bet.market.status === "resolved";
                  const won = isResolved && bet.market.resolvedOutcome === bet.outcome;
                  const pnl = isResolved
                    ? won
                      ? (bet.shares - bet.costBasis).toFixed(1)
                      : (-bet.costBasis).toFixed(1)
                    : "—";

                  return (
                    <tr key={bet.id} className="border-b border-[var(--border-color)] last:border-0">
                      <td className="p-3 text-muted whitespace-nowrap">
                        {new Date(bet.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="p-3 max-w-[200px] truncate">{bet.market.question}</td>
                      <td className={`p-3 text-center font-bold ${bet.outcome ? "text-[var(--yes-color)]" : "text-[var(--no-color)]"}`}>
                        {bet.outcome ? "YES" : "NO"}
                      </td>
                      <td className="p-3 text-right font-mono">{bet.costBasis.toFixed(1)}</td>
                      <td className={`p-3 text-right font-mono font-bold ${
                        pnl === "—" ? "text-muted" : parseFloat(pnl) >= 0 ? "text-[var(--yes-color)]" : "text-[var(--no-color)]"
                      }`}>
                        {pnl !== "—" && parseFloat(pnl) > 0 ? "+" : ""}{pnl}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && bets && bets.length === 0 && (
        <div className="text-center py-16">
          <BarChart3 className="w-10 h-10 text-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">No Bets Yet</h2>
          <p className="text-muted mb-4">Start predicting on open markets.</p>
          <Link href="/" className="btn btn-primary">Browse Markets</Link>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <AuthGuard>
        <DashboardContent />
      </AuthGuard>
    </main>
  );
}
