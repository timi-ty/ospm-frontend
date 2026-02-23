"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlayToken } from "@/hooks/usePlayToken";
import { useMarketContract, usePlaceBet } from "@/hooks/useMarketContract";

interface TradePanelProps {
  marketAddress: `0x${string}`;
  marketId: string;
}

export default function TradePanel({ marketAddress }: TradePanelProps) {
  const { isAuthenticated, login } = useAuth();
  const { balance, rawBalance } = usePlayToken();
  const { yesPercent, noPercent, hasBet, betShares, betOutcome, betCost, chainStatus, refetchOdds, refetchBet } =
    useMarketContract(marketAddress);
  const { approve, placeBet, approveSuccess, betSuccess, isPending, step } = usePlaceBet(marketAddress);

  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [amount, setAmount] = useState("");
  const [txDone, setTxDone] = useState(false);

  // After approval succeeds, automatically place the bet
  useEffect(() => {
    if (approveSuccess && outcome !== null && amount && step === "bet") {
      placeBet(outcome, amount);
    }
  }, [approveSuccess, step]);

  // After bet succeeds, refresh state
  useEffect(() => {
    if (betSuccess) {
      setTxDone(true);
      refetchOdds();
      refetchBet();
      setAmount("");
      setOutcome(null);
    }
  }, [betSuccess]);

  if (!isAuthenticated) {
    return (
      <div className="card p-6 text-center">
        <p className="text-muted mb-4">Sign in to place predictions</p>
        <button onClick={login} className="btn btn-primary">
          Sign In
        </button>
      </div>
    );
  }

  if (chainStatus !== "open") {
    return (
      <div className="card p-6 text-center">
        <p className="text-muted">
          {chainStatus === "resolved" ? "This market has been resolved." : "Betting is closed."}
        </p>
      </div>
    );
  }

  const hasBalance = rawBalance && rawBalance > BigInt(0);

  if (!hasBalance) {
    return (
      <div className="card p-6 text-center">
        <p className="text-muted mb-2">You need $PLAY tokens to trade.</p>
        <p className="text-sm text-[var(--accent)]">Click your PLAY balance in the nav bar to claim free tokens.</p>
      </div>
    );
  }

  if (hasBet) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Your Position</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted">Side</div>
            <div className={`text-lg font-bold ${betOutcome ? "text-[var(--yes-color)]" : "text-[var(--no-color)]"}`}>
              {betOutcome ? "YES" : "NO"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Shares</div>
            <div className="text-lg font-bold font-mono">{parseFloat(betShares).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Cost</div>
            <div className="text-lg font-bold font-mono">{parseFloat(betCost).toFixed(1)}</div>
          </div>
        </div>
      </div>
    );
  }

  const handleTrade = () => {
    if (outcome === null || !amount || parseFloat(amount) <= 0) return;
    approve(amount);
  };

  const estimatedShares = outcome !== null && amount
    ? (parseFloat(amount) / (outcome ? yesPercent / 100 : noPercent / 100)).toFixed(1)
    : "0";

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Trade</h3>

      {txDone && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--yes-color)]/10 text-[var(--yes-color)] text-sm font-medium">
          Bet placed successfully!
        </div>
      )}

      {/* Outcome selection */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => { setOutcome(true); setTxDone(false); }}
          className={`py-3 rounded-lg text-sm font-bold transition-all ${
            outcome === true
              ? "bg-[var(--yes-color)] text-white scale-[1.02]"
              : "bg-[var(--yes-color)]/10 text-[var(--yes-color)] hover:bg-[var(--yes-color)]/20"
          }`}
        >
          YES {yesPercent}%
        </button>
        <button
          onClick={() => { setOutcome(false); setTxDone(false); }}
          className={`py-3 rounded-lg text-sm font-bold transition-all ${
            outcome === false
              ? "bg-[var(--no-color)] text-white scale-[1.02]"
              : "bg-[var(--no-color)]/10 text-[var(--no-color)] hover:bg-[var(--no-color)]/20"
          }`}
        >
          NO {noPercent}%
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label className="text-xs text-muted font-medium block mb-1">Amount ($PLAY)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted">Balance: {parseFloat(balance).toFixed(0)} PLAY</span>
          <button
            onClick={() => setAmount(parseFloat(balance).toFixed(0))}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Max
          </button>
        </div>
      </div>

      {/* Preview */}
      {outcome !== null && amount && parseFloat(amount) > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--foreground)]/3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Est. shares</span>
            <span className="font-mono">~{estimatedShares}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Potential payout</span>
            <span className="font-mono">~{estimatedShares} PLAY</span>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={isPending || outcome === null || !amount || parseFloat(amount) <= 0}
        className="btn btn-primary btn-full"
      >
        {isPending
          ? step === "approve" ? "Approving..." : "Placing Bet..."
          : "Place Bet"}
      </button>
    </div>
  );
}
