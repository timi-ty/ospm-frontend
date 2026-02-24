"use client";

import { useState } from "react";
import { useBalance } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import { parseEther } from "viem";
import { baseSepolia } from "viem/chains";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";
const LOW_GAS_THRESHOLD = parseEther("0.0001");

export default function GasWarning() {
  const { address, isAuthenticated, getAccessToken } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const { data: balance, refetch } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: baseSepolia.id,
    query: { enabled: !!address && isAuthenticated },
  });

  if (!isAuthenticated || !balance || balance.value >= LOW_GAS_THRESHOLD) {
    return null;
  }

  const requestGas = async () => {
    setPending(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${ORACLE_URL}/api/gas/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request gas");
      toast("Gas received! You can now make transactions.", "success");
      refetch();
    } catch (err: any) {
      toast(err.message || "Failed to request gas", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-4 lg:mx-8 mt-4 p-3 rounded-lg bg-[var(--no-color)]/10 border border-[var(--no-color)]/20 text-sm flex items-center justify-between gap-3 flex-wrap">
      <div>
        <span className="font-medium text-[var(--no-color)]">Low gas balance.</span>{" "}
        <span className="text-muted">Your wallet needs Base Sepolia ETH for transaction fees.</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={requestGas}
          disabled={pending}
          className="btn btn-primary btn-sm whitespace-nowrap"
        >
          {pending ? <Spinner size="sm" /> : "Get Free Gas"}
        </button>
        <a
          href="https://bwarelabs.com/faucets/base-sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted hover:text-[var(--accent)] whitespace-nowrap"
        >
          or get manually
        </a>
      </div>
    </div>
  );
}
