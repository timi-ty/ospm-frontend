export interface Market {
  id: string;
  question: string;
  description: string | null;
  category: string;
  sourceUrl: string;
  contractAddress: string | null;
  bettingClosesAt: string;
  resolvesAt: string;
  status: string;
  resolvedOutcome: boolean | null;
  b: number;
  qYes: number;
  qNo: number;
  createdAt: string;
  deployedAt: string | null;
  resolvedAt: string | null;
}

export interface MarketsResponse {
  markets: Market[];
  total: number;
  hasMore: boolean;
}

export interface MarketResponse {
  market: Market;
}

export interface MarketsParams {
  status?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UserBet {
  id: string;
  outcome: boolean;
  shares: number;
  costBasis: number;
  claimed: boolean;
  createdAt: string;
  market: {
    id: string;
    question: string;
    contractAddress: string | null;
    status: string;
    resolvedOutcome: boolean | null;
    qYes: number;
    qNo: number;
    b: number;
  };
}

export interface LeaderboardEntry {
  address: string;
  wins: number;
  totalProfit: string;
  totalBets: number;
}
