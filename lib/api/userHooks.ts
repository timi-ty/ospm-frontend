import useSWR from "swr";
import { getUserBets, getLeaderboard } from "./userClient";
import type { UserBet, LeaderboardEntry } from "./types";

export function useUserBets(address: string | undefined, token: string | null) {
  return useSWR<UserBet[]>(
    address && token ? ["userBets", address] : null,
    () => getUserBets(address!, token!),
    { refreshInterval: 30000 }
  );
}

export function useLeaderboard() {
  return useSWR<LeaderboardEntry[]>(
    "leaderboard",
    () => getLeaderboard(),
    { refreshInterval: 60000 }
  );
}
