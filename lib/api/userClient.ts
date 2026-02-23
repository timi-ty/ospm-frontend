import type { UserBet, LeaderboardEntry } from "./types";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

export async function getUserBets(address: string, token: string): Promise<UserBet[]> {
  const res = await fetch(`${ORACLE_URL}/api/users/${address}/bets`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user bets: ${res.status}`);
  }

  return res.json();
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${ORACLE_URL}/api/leaderboard`);

  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  }

  return res.json();
}
