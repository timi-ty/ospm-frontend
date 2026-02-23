import useSWR from "swr";
import { getAdminStats, getTimeseries, getAdminMarkets, getMarketById, getSystemInfo } from "./admin";

export function useAdminStats() {
  return useSWR("admin-stats", getAdminStats, { refreshInterval: 15000 });
}

export function useTimeseries(days = 7) {
  return useSWR(["admin-timeseries", days], () => getTimeseries(days), { refreshInterval: 60000 });
}

export function useAdminMarkets(params: Record<string, string | number | boolean | undefined> = {}) {
  const key = JSON.stringify(["admin-markets", params]);
  return useSWR(key, () => getAdminMarkets(params), { refreshInterval: 15000 });
}

export function useAdminMarket(id: string | null) {
  return useSWR(id ? ["admin-market", id] : null, () => getMarketById(id!), { refreshInterval: 10000 });
}

export function useSystemInfo() {
  return useSWR("admin-system", getSystemInfo, { refreshInterval: 10000 });
}
