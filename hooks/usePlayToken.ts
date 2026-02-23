"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { PLAY_TOKEN_ABI } from "@/lib/contracts/abis";
import { PLAY_TOKEN_ADDRESS } from "@/lib/contracts/addresses";
import { useAuth } from "./useAuth";

export function usePlayToken() {
  const { address } = useAuth();

  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: PLAY_TOKEN_ADDRESS,
    abi: PLAY_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  const { data: canClaim } = useReadContract({
    address: PLAY_TOKEN_ADDRESS,
    abi: PLAY_TOKEN_ABI,
    functionName: "canClaimFaucet",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  const { data: timeUntilClaim } = useReadContract({
    address: PLAY_TOKEN_ADDRESS,
    abi: PLAY_TOKEN_ABI,
    functionName: "timeUntilNextClaim",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimFaucet = () => {
    writeContract({
      address: PLAY_TOKEN_ADDRESS,
      abi: PLAY_TOKEN_ABI,
      functionName: "faucet",
    });
  };

  return {
    balance: rawBalance ? formatEther(rawBalance as bigint) : "0",
    rawBalance: rawBalance as bigint | undefined,
    canClaim: canClaim as boolean | undefined,
    timeUntilClaim: timeUntilClaim ? Number(timeUntilClaim) : 0,
    claimFaucet,
    isPending: isPending || isConfirming,
    isSuccess,
    refetchBalance,
  };
}
