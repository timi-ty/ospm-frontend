"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { usePlayToken } from "@/hooks/usePlayToken";

interface FaucetModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FaucetModal({ open, onClose }: FaucetModalProps) {
  const { balance, canClaim, timeUntilClaim, claimFaucet, isPending, isSuccess, refetchBalance } = usePlayToken();

  useEffect(() => {
    if (isSuccess) refetchBalance();
  }, [isSuccess]);

  if (!open) return null;

  const hours = Math.floor(timeUntilClaim / 3600);
  const mins = Math.floor((timeUntilClaim % 3600) / 60);
  const cooldownText = timeUntilClaim > 0 ? `${hours}h ${mins}m` : null;
  const formatted = parseFloat(balance);
  const displayBalance = formatted >= 1000
    ? formatted.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : formatted.toFixed(0);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)] p-8 w-full max-w-[360px] shadow-2xl pointer-events-auto">

          {/* Close */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--foreground)]/5 transition-colors text-muted text-lg leading-none"
            >
              &times;
            </button>
          </div>

          {/* Balance */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold font-mono tracking-tight mb-1">{displayBalance}</div>
            <div className="text-sm text-muted">$PLAY Balance</div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-color)] mb-8" />

          {/* Action */}
          {isSuccess ? (
            <div className="text-center py-3 px-4 rounded-xl bg-[var(--yes-color)]/10 mb-6">
              <div className="text-[var(--yes-color)] font-semibold">1,000 $PLAY claimed</div>
            </div>
          ) : canClaim ? (
            <button
              onClick={claimFaucet}
              disabled={isPending}
              className="btn btn-primary btn-full mb-6"
            >
              {isPending ? "Claiming..." : "Claim 1,000 $PLAY"}
            </button>
          ) : (
            <div className="text-center mb-6">
              <div className="text-xs text-muted uppercase tracking-wider mb-3">Next claim in</div>
              <div className="text-3xl font-bold font-mono tracking-tight">{cooldownText || "—"}</div>
            </div>
          )}

          {/* Footer */}
          <p className="text-xs text-muted text-center leading-relaxed">
            Free tokens for testing predictions.<br />1,000 $PLAY every 24 hours.
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}
