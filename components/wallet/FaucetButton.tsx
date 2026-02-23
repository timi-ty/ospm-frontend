"use client";

import { useEffect } from "react";
import { usePlayToken } from "@/hooks/usePlayToken";

export default function FaucetButton() {
  const { balance, canClaim, timeUntilClaim, claimFaucet, isPending, isSuccess, refetchBalance } = usePlayToken();

  useEffect(() => {
    if (isSuccess) refetchBalance();
  }, [isSuccess]);

  const cooldownText = timeUntilClaim > 0
    ? `${Math.floor(timeUntilClaim / 3600)}h ${Math.floor((timeUntilClaim % 3600) / 60)}m`
    : null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={claimFaucet}
        disabled={!canClaim || isPending}
        className="btn btn-primary btn-sm"
      >
        {isPending ? "Claiming..." : isSuccess ? "Claimed!" : "Claim 1,000 $PLAY"}
      </button>
      {cooldownText && canClaim === false && (
        <span className="text-xs text-muted">Next claim in {cooldownText}</span>
      )}
    </div>
  );
}
