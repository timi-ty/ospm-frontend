"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMarket } from "@/lib/api/hooks";
import { useMarketContract } from "@/hooks/useMarketContract";
import NavBar from "@/components/NavBar";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/admin/StatusBadge";
import TradePanel from "@/components/trading/TradePanel";
import ClaimWinnings from "@/components/trading/ClaimWinnings";

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "passed";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 48) return `${Math.floor(hours / 24)} days`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error } = useMarket(id);
  const market = data?.market;

  const contractAddr = market?.contractAddress as `0x${string}` | undefined;
  const { yesPercent, noPercent, chainStatus } = useMarketContract(contractAddr);

  if (error) {
    return (
      <>
        <NavBar />
        <div className="max-w-3xl mx-auto p-8">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-[var(--accent)] mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Link>
          <div className="text-center py-20 text-[var(--no-color)]">Market not found.</div>
        </div>
      </>
    );
  }

  if (!market) {
    return (
      <>
        <NavBar />
        <div className="max-w-3xl mx-auto p-8">
          <Spinner label="Loading market..." />
        </div>
      </>
    );
  }

  const isResolved = chainStatus === "resolved" || market.status === "resolved";
  const isOpen = chainStatus === "open" && market.status === "open";

  return (
    <>
    <NavBar />
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-[var(--accent)] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Markets
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted bg-[var(--foreground)]/5 px-2 py-1 rounded shrink-0">
          {market.category}
        </span>
        <StatusBadge status={market.status} />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
        {market.question}
      </h1>

      {market.description && (
        <p className="text-muted mb-6">{market.description}</p>
      )}

      {/* Odds Display */}
      {contractAddr && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold font-mono text-[var(--yes-color)]">{yesPercent}%</div>
              <div className="text-xs text-muted uppercase tracking-wider mt-1">Yes</div>
            </div>
            <div className="text-muted text-sm font-medium px-4">vs</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold font-mono text-[var(--no-color)]">{noPercent}%</div>
              <div className="text-xs text-muted uppercase tracking-wider mt-1">No</div>
            </div>
          </div>
          <div className="probability-bar">
            <div
              className="probability-bar-fill probability-bar-yes"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Trade Panel or Claim Winnings */}
      {isOpen && contractAddr && (
        <div className="mb-6">
          <TradePanel marketAddress={contractAddr} marketId={market.id} />
        </div>
      )}

      {isResolved && contractAddr && (
        <div className="mb-6">
          <div className="card p-5 mb-4">
            <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Outcome</div>
            <div className={`text-2xl font-bold ${market.resolvedOutcome ? "text-[var(--yes-color)]" : "text-[var(--no-color)]"}`}>
              {market.resolvedOutcome ? "YES" : "NO"}
            </div>
          </div>
          <ClaimWinnings marketAddress={contractAddr} />
        </div>
      )}

      {/* Market Info */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider">Betting Closes</div>
            <div className="text-sm font-medium mt-1">{formatDateTime(market.bettingClosesAt)}</div>
            <div className="text-xs text-muted">{formatRelative(market.bettingClosesAt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider">Resolves</div>
            <div className="text-sm font-medium mt-1">{formatDateTime(market.resolvesAt)}</div>
            <div className="text-xs text-muted">{formatRelative(market.resolvesAt)}</div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-4 text-xs">
        <a
          href={market.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          View Source →
        </a>
        {contractAddr && (
          <a
            href={`https://sepolia.basescan.org/address/${contractAddr}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            View on BaseScan →
          </a>
        )}
      </div>
    </div>
    </>
  );
}
