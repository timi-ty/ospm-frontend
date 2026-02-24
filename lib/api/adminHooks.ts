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
