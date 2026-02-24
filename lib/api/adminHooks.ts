import useSWR from "swr";
import { getAdminStats, getTimeseries, getAdminMarkets, getMarketById, getSystemInfo, getMarketMaking } from "./admin";
import { useAdminToken } from "./useAdminToken";

export function useAdminStats() {
  const token = useAdminToken();
  return useSWR(token ? "admin-stats" : null, () => getAdminStats(token!), { refreshInterval: 15000 });
}

export function useTimeseries(days = 7) {
  const token = useAdminToken();
  return useSWR(token ? ["admin-timeseries", days] : null, () => getTimeseries(days, token!), { refreshInterval: 60000 });
}

export function useAdminMarkets(params: Record<string, string | number | boolean | undefined> = {}) {
  const token = useAdminToken();
  const key = token ? JSON.stringify(["admin-markets", params]) : null;
  return useSWR(key, () => getAdminMarkets(params, token!), { refreshInterval: 15000 });
}

export function useAdminMarket(id: string | null) {
  return useSWR(id ? ["admin-market", id] : null, () => getMarketById(id!), { refreshInterval: 10000 });
}

export function useSystemInfo() {
  const token = useAdminToken();
  return useSWR(token ? "admin-system" : null, () => getSystemInfo(token!), { refreshInterval: 10000 });
}

export function useMarketMaking() {
  const token = useAdminToken();
  return useSWR(token ? "admin-market-making" : null, () => getMarketMaking(token!), { refreshInterval: 30000 });
}

interface HealthHandler {
  name: string;
  lastRunAt: string | null;
}

interface HealthEntry {
  tickCount: number;
  status: string;
  details: Record<string, string> | null;
  createdAt: string;
}

export interface DetailedHealth {
  status: string;
  uptimeSeconds: number;
  lastTickAt: string | null;
  tickCount: number;
  handlers: HealthHandler[];
  recentHealth: HealthEntry[];
}

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

async function fetchDetailedHealth(): Promise<DetailedHealth> {
  const res = await fetch(`${ORACLE_URL}/health/detailed`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export function useDetailedHealth() {
  return useSWR<DetailedHealth>("health-detailed", fetchDetailedHealth, {
    refreshInterval: 15000,
    errorRetryCount: 2,
  });
}
