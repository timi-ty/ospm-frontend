"use client";

import { useEffect } from "react";
import { useMarketContract, useClaimWinnings } from "@/hooks/useMarketContract";
import { usePlayToken } from "@/hooks/usePlayToken";

interface ClaimWinningsProps {
  marketAddress: `0x${string}`;
}

export default function ClaimWinnings({ marketAddress }: ClaimWinningsProps) {
  const { resolvedOutcome, hasBet, betOutcome, betShares, betClaimed } =
    useMarketContract(marketAddress);
  const { claim, isPending, isSuccess } = useClaimWinnings(marketAddress);
  const { refetchBalance } = usePlayToken();

  useEffect(() => {
    if (isSuccess) refetchBalance();
  }, [isSuccess]);

  if (!hasBet) return null;

  const won = resolvedOutcome === betOutcome;

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Result</h3>
      {won ? (
        <>
          <div className="text-[var(--yes-color)] font-bold text-lg mb-2">You won!</div>
          <div className="text-sm text-muted mb-4">
            Payout: <span className="font-mono font-bold">{parseFloat(betShares).toFixed(1)} PLAY</span>
          </div>
          {betClaimed || isSuccess ? (
            <div className="text-sm text-[var(--yes-color)]">Winnings claimed</div>
          ) : (
            <button onClick={claim} disabled={isPending} className="btn btn-yes w-full">
              {isPending ? "Claiming..." : "Claim Winnings"}
            </button>
          )}
        </>
      ) : (
        <div className="text-[var(--no-color)] font-bold">
          You predicted {betOutcome ? "YES" : "NO"} — the outcome was {resolvedOutcome ? "YES" : "NO"}.
        </div>
      )}
    </div>
  );
}
