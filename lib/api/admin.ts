const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

export async function getAdminStats() {
  const res = await fetch(`${ORACLE_URL}/api/admin/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

export async function getTimeseries(days = 7) {
  const res = await fetch(`${ORACLE_URL}/api/admin/stats/timeseries?days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch timeseries: ${res.status}`);
  return res.json();
}

export async function getAdminMarkets(params: Record<string, string | number | boolean | undefined> = {}) {
  const url = new URL(`${ORACLE_URL}/api/admin/markets`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  return res.json();
}

export async function getAdminMarket(id: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/markets?search=&limit=100`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const data = await res.json();
  return data.markets.find((m: any) => m.id === id) || null;
}

export async function getMarketById(id: string) {
  const res = await fetch(`${ORACLE_URL}/api/markets/${id}`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const data = await res.json();
  return data.market;
}

export async function getSystemInfo() {
  const res = await fetch(`${ORACLE_URL}/api/admin/system`);
  if (!res.ok) throw new Error(`Failed to fetch system info: ${res.status}`);
  return res.json();
}

export async function resolveMarket(id: string, outcome: boolean) {
  const res = await fetch(`${ORACLE_URL}/api/admin/markets/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function triggerGeneration() {
  const res = await fetch(`${ORACLE_URL}/api/admin/trigger-generation`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function triggerDeployment() {
  const res = await fetch(`${ORACLE_URL}/api/admin/trigger-deployment`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}
