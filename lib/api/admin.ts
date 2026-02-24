const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

function adminHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function getAdminStats(token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/stats`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

export async function getTimeseries(days = 7, token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/stats/timeseries?days=${days}`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error(`Failed to fetch timeseries: ${res.status}`);
  return res.json();
}

export async function getAdminMarkets(params: Record<string, string | number | boolean | undefined> = {}, token: string) {
  const url = new URL(`${ORACLE_URL}/api/admin/markets`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { headers: adminHeaders(token) });
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  return res.json();
}

export async function getMarketById(id: string) {
  const res = await fetch(`${ORACLE_URL}/api/markets/${id}`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const data = await res.json();
  return data.market;
}

export async function getSystemInfo(token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/system`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error(`Failed to fetch system info: ${res.status}`);
  return res.json();
}

export async function resolveMarket(id: string, outcome: boolean, token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/markets/${id}/resolve`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ outcome }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function triggerGeneration(token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/trigger-generation`, { method: "POST", headers: adminHeaders(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function triggerDeployment(token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/trigger-deployment`, { method: "POST", headers: adminHeaders(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function getMarketMaking(token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/market-making`, { headers: adminHeaders(token) });
  if (!res.ok) throw new Error(`Failed to fetch market-making stats: ${res.status}`);
  return res.json();
}

export async function updateAdminWallet(privateKey: string, password: string, token: string) {
  const res = await fetch(`${ORACLE_URL}/api/admin/wallet`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ privateKey, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error);
  }
  return res.json();
}
