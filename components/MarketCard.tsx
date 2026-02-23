import Link from "next/link";
import type { Market } from "@/lib/api/types";
import StatusBadge from "@/components/admin/StatusBadge";

interface MarketCardProps {
  market: Market;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "passed";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 48) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function computeOdds(qYes: number, qNo: number, b: number): { yes: number; no: number } {
  if (b === 0) return { yes: 50, no: 50 };
  const a = qYes / b;
  const d = qNo / b;
  const m = Math.max(a, d);
  const expA = Math.exp(a - m);
  const expD = Math.exp(d - m);
  const sum = expA + expD;
  const yes = Math.round((expA / sum) * 100);
  return { yes, no: 100 - yes };
}

export default function MarketCard({ market }: MarketCardProps) {
  const odds = computeOdds(market.qYes ?? 0, market.qNo ?? 0, market.b ?? 100);

  return (
    <Link href={`/markets/${market.id}`} className="block">
      <div className="card animate-fade-in-up hover:border-[var(--border-hover)] transition-all cursor-pointer">
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted bg-[var(--foreground)]/5 px-2 py-1 rounded">
            {market.category}
          </span>
          <StatusBadge status={market.status} />
        </div>

        {/* Question */}
        <h3 className="text-base font-semibold leading-tight mb-2 line-clamp-2">
          {market.question}
        </h3>

        {/* Description */}
        {market.description && (
          <p className="text-sm text-muted mb-3 line-clamp-2">
            {market.description}
          </p>
        )}

        {/* Odds Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-[var(--yes-color)] font-semibold">YES {odds.yes}%</span>
            <span className="text-[var(--no-color)] font-semibold">NO {odds.no}%</span>
          </div>
          <div className="probability-bar">
            <div className="probability-bar-fill probability-bar-yes" style={{ width: `${odds.yes}%` }} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] text-xs text-muted">
          <span>Closes {formatRelative(market.bettingClosesAt)}</span>
          <span>{formatDate(market.bettingClosesAt)}</span>
        </div>
      </div>
    </Link>
  );
}
