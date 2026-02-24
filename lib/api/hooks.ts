import useSWR from "swr";
import { getMarkets, getMarket } from "./client";
import type { MarketsParams, MarketsResponse, MarketResponse } from "./types";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

export function useMarkets(params?: MarketsParams) {
  return useSWR<MarketsResponse>(
    ["markets", params],
    () => getMarkets(params),
    { refreshInterval: 30000 }
  );
}

export function useMarket(id: string | null) {
  return useSWR<MarketResponse>(
    id ? ["market", id] : null,
    () => getMarket(id!)
  );
}

interface HealthData {
  status: string;
  uptimeSeconds: number;
  lastTickAt: string | null;
  tickCount: number;
}

async function fetchHealth(): Promise<HealthData> {
  const res = await fetch(`${ORACLE_URL}/health/detailed`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export function useHealth() {
  return useSWR<HealthData>("health", fetchHealth, {
    refreshInterval: 60000,
    errorRetryCount: 2,
  });
}
