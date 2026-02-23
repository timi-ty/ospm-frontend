"use client";

import { useState } from "react";
import { usePlayToken } from "@/hooks/usePlayToken";
import { useAuth } from "@/hooks/useAuth";
import FaucetModal from "./FaucetModal";

export default function WalletBalance() {
  const { isAuthenticated } = useAuth();
  const { balance } = usePlayToken();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  const formatted = parseFloat(balance);
  const display = formatted >= 1000
    ? `${(formatted / 1000).toFixed(1)}k`
    : formatted.toFixed(0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors text-xs font-medium cursor-pointer"
      >
        <span className="font-mono">{display}</span>
        <span className="text-muted">PLAY</span>
      </button>
      <FaucetModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
