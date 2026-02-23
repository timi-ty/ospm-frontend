import type { MarketsResponse, MarketResponse, MarketsParams } from "./types";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

export async function getMarkets(params?: MarketsParams): Promise<MarketsResponse> {
  const url = new URL(`${ORACLE_URL}/api/markets`);
  
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.limit) url.searchParams.set("limit", params.limit.toString());
  if (params?.offset) url.searchParams.set("offset", params.offset.toString());
  
  const res = await fetch(url.toString());
  
  if (!res.ok) {
    throw new Error(`Failed to fetch markets: ${res.status}`);
  }
  
  return res.json();
}

export async function getMarket(id: string): Promise<MarketResponse> {
  const res = await fetch(`${ORACLE_URL}/api/markets/${id}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch market: ${res.status}`);
  }
  
  return res.json();
}
