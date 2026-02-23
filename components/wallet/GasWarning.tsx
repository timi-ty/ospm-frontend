"use client";

import { useBalance } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { parseEther } from "viem";
import { baseSepolia } from "viem/chains";

const LOW_GAS_THRESHOLD = parseEther("0.0001");

export default function GasWarning() {
  const { address, isAuthenticated } = useAuth();

  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: baseSepolia.id,
    query: { enabled: !!address && isAuthenticated },
  });

  if (!isAuthenticated || !balance || balance.value >= LOW_GAS_THRESHOLD) {
    return null;
  }

  return (
    <div className="mx-4 md:mx-8 mt-4 p-3 rounded-lg bg-[var(--no-color)]/10 border border-[var(--no-color)]/20 text-sm">
      <span className="font-medium text-[var(--no-color)]">Low gas balance.</span>{" "}
      <span className="text-muted">
        Your wallet needs Base Sepolia ETH for transaction fees.{" "}
        <a
          href="https://bwarelabs.com/faucets/base-sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          Get testnet ETH
        </a>
      </span>
    </div>
  );
}
