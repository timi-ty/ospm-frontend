"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { BINARY_MARKET_ABI, PLAY_TOKEN_ABI } from "@/lib/contracts/abis";
import { PLAY_TOKEN_ADDRESS } from "@/lib/contracts/addresses";
import { useAuth } from "./useAuth";

// On-chain status enum: OPEN=0, PROPOSED=1, RESOLVED=2, DISPUTED=3
const STATUS_LABELS = ["open", "proposed", "resolved", "disputed"] as const;

export function useMarketContract(marketAddress: `0x${string}` | undefined) {
  const { address: userAddress } = useAuth();

  const { data: oddsData, refetch: refetchOdds } = useReadContract({
    address: marketAddress,
    abi: BINARY_MARKET_ABI,
    functionName: "getOdds",
    query: { enabled: !!marketAddress, refetchInterval: 15000 },
  });

  const { data: onChainStatus } = useReadContract({
    address: marketAddress,
    abi: BINARY_MARKET_ABI,
    functionName: "status",
    query: { enabled: !!marketAddress, refetchInterval: 15000 },
  });

  const { data: resolvedOutcome } = useReadContract({
    address: marketAddress,
    abi: BINARY_MARKET_ABI,
    functionName: "resolvedOutcome",
    query: { enabled: !!marketAddress },
  });

  const { data: userBet, refetch: refetchBet } = useReadContract({
    address: marketAddress,
    abi: BINARY_MARKET_ABI,
    functionName: "bets",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: !!marketAddress && !!userAddress },
  });

  // Parse odds (WAD values → percentages)
  const pYes = oddsData ? Number((oddsData as [bigint, bigint])[0]) / 1e18 : 0.5;
  const pNo = oddsData ? Number((oddsData as [bigint, bigint])[1]) / 1e18 : 0.5;

  // Parse user's existing bet
  const bet = userBet as [bigint, boolean, bigint, boolean] | undefined;
  const hasBet = bet ? bet[0] > 0n : false;
  const betShares = bet ? formatEther(bet[0]) : "0";
  const betOutcome = bet ? bet[1] : false;
  const betCost = bet ? formatEther(bet[2]) : "0";
  const betClaimed = bet ? bet[3] : false;

  const statusNum = onChainStatus !== undefined ? Number(onChainStatus) : 0;
  const chainStatus = STATUS_LABELS[statusNum] || "open";

  return {
    pYes,
    pNo,
    yesPercent: Math.round(pYes * 100),
    noPercent: Math.round(pNo * 100),
    chainStatus,
    resolvedOutcome: resolvedOutcome as boolean | undefined,
    hasBet,
    betShares,
    betOutcome,
    betCost,
    betClaimed,
    refetchOdds,
    refetchBet,
  };
}

export function usePlaceBet(marketAddress: `0x${string}` | undefined) {
  const { writeContract: writeApprove, data: approveHash, isPending: approvePending, error: approveError } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeBet, data: betHash, isPending: betPending, error: betError } = useWriteContract();
  const { isLoading: betConfirming, isSuccess: betSuccess } = useWaitForTransactionReceipt({ hash: betHash });

  const approve = (amount: string) => {
    if (!marketAddress) return;
    writeApprove({
      address: PLAY_TOKEN_ADDRESS,
      abi: PLAY_TOKEN_ABI,
      functionName: "approve",
      args: [marketAddress, parseEther(amount)],
    });
  };

  const placeBet = (outcome: boolean, maxCost: string) => {
    if (!marketAddress) return;
    writeBet({
      address: marketAddress,
      abi: BINARY_MARKET_ABI,
      functionName: "placeBet",
      args: [outcome, parseEther(maxCost)],
    });
  };

  return {
    approve,
    placeBet,
    approveSuccess,
    betSuccess,
    isPending: approvePending || approveConfirming || betPending || betConfirming,
    step: approveSuccess ? "bet" : "approve",
    error: approveError || betError,
  };
}

export function useClaimWinnings(marketAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = () => {
    if (!marketAddress) return;
    writeContract({
      address: marketAddress,
      abi: BINARY_MARKET_ABI,
      functionName: "claimWinnings",
    });
  };

  return { claim, isPending: isPending || isConfirming, isSuccess };
}
