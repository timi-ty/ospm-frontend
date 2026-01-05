/**
 * LMSR (Logarithmic Market Scoring Rule) Implementation
 * 
 * This module provides pure functions for prediction market pricing using LMSR.
 * 
 * Key concepts:
 * - qYes, qNo: Total outstanding shares for each outcome
 * - b: Liquidity parameter (higher = smoother prices, more subsidy)
 * - Cost function: C(q) = b * ln(exp(qYes/b) + exp(qNo/b))
 * - Price = derivative of cost function = probability of outcome
 */

export interface MarketState {
  qYes: number;
  qNo: number;
  b: number;
}

export interface Prices {
  pYes: number;
  pNo: number;
}

export interface TradeSimulation {
  deltaShares: number;
  cost: number;
  pBefore: number;
  pAfter: number;
}

/**
 * Calculate the LMSR cost function value.
 * 
 * C(qYes, qNo) = b * ln(exp(qYes/b) + exp(qNo/b))
 * 
 * Note: We use the log-sum-exp trick for numerical stability:
 * ln(exp(a) + exp(b)) = max(a,b) + ln(exp(a - max) + exp(b - max))
 */
export function cost(qYes: number, qNo: number, b: number): number {
  const a = qYes / b;
  const d = qNo / b;
  
  // Log-sum-exp trick for numerical stability
  const maxVal = Math.max(a, d);
  const logSumExp = maxVal + Math.log(Math.exp(a - maxVal) + Math.exp(d - maxVal));
  
  return b * logSumExp;
}

/**
 * Calculate current prices (probabilities) for Yes and No outcomes.
 * 
 * pYes = exp(qYes/b) / (exp(qYes/b) + exp(qNo/b))
 * pNo = exp(qNo/b) / (exp(qYes/b) + exp(qNo/b))
 * 
 * Prices always sum to 1 and represent implied probabilities.
 */
export function prices(qYes: number, qNo: number, b: number): Prices {
  const a = qYes / b;
  const d = qNo / b;
  
  // Softmax for numerical stability
  const maxVal = Math.max(a, d);
  const expA = Math.exp(a - maxVal);
  const expD = Math.exp(d - maxVal);
  const sum = expA + expD;
  
  return {
    pYes: expA / sum,
    pNo: expD / sum,
  };
}

/**
 * Calculate the cost to buy a specific number of shares.
 * 
 * @param side - "YES" or "NO"
 * @param qYes - Current Yes shares outstanding
 * @param qNo - Current No shares outstanding  
 * @param b - Liquidity parameter
 * @param deltaShares - Number of shares to buy
 * @returns The cost in tokens
 */
export function costToBuyShares(
  side: "YES" | "NO",
  qYes: number,
  qNo: number,
  b: number,
  deltaShares: number
): number {
  const currentCost = cost(qYes, qNo, b);
  
  let newCost: number;
  if (side === "YES") {
    newCost = cost(qYes + deltaShares, qNo, b);
  } else {
    newCost = cost(qYes, qNo + deltaShares, b);
  }
  
  return newCost - currentCost;
}

/**
 * Simulate buying shares with a fixed spend amount.
 * Uses binary search to find how many shares can be purchased.
 * 
 * @param side - "YES" or "NO"
 * @param qYes - Current Yes shares outstanding
 * @param qNo - Current No shares outstanding
 * @param b - Liquidity parameter
 * @param spend - Amount of tokens to spend
 * @param iterations - Binary search iterations (default 50 for high precision)
 * @returns Simulation result with shares received and price movement
 */
export function simulateBuy(
  side: "YES" | "NO",
  qYes: number,
  qNo: number,
  b: number,
  spend: number,
  iterations: number = 50
): TradeSimulation {
  if (spend <= 0) {
    const { pYes, pNo } = prices(qYes, qNo, b);
    return {
      deltaShares: 0,
      cost: 0,
      pBefore: side === "YES" ? pYes : pNo,
      pAfter: side === "YES" ? pYes : pNo,
    };
  }

  const baseCost = cost(qYes, qNo, b);
  const { pYes: pYesBefore, pNo: pNoBefore } = prices(qYes, qNo, b);
  
  // Binary search for delta that matches spend
  let low = 0;
  let high = spend * 10; // Upper bound heuristic - will refine
  
  // Expand upper bound if needed
  while (costToBuyShares(side, qYes, qNo, b, high) < spend) {
    high *= 2;
    if (high > 1e12) break; // Safety limit
  }
  
  // Binary search
  for (let i = 0; i < iterations; i++) {
    const mid = (low + high) / 2;
    const c = costToBuyShares(side, qYes, qNo, b, mid);
    
    if (c > spend) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  const deltaShares = low;
  const actualCost = costToBuyShares(side, qYes, qNo, b, deltaShares);
  
  // Calculate new prices
  let newQYes = qYes;
  let newQNo = qNo;
  if (side === "YES") {
    newQYes += deltaShares;
  } else {
    newQNo += deltaShares;
  }
  
  const { pYes: pYesAfter, pNo: pNoAfter } = prices(newQYes, newQNo, b);
  
  return {
    deltaShares,
    cost: actualCost,
    pBefore: side === "YES" ? pYesBefore : pNoBefore,
    pAfter: side === "YES" ? pYesAfter : pNoAfter,
  };
}

/**
 * Calculate the maximum possible loss for the market maker.
 * For a binary market: max_loss = b * ln(2)
 * 
 * This is the subsidy the operator provides to guarantee liquidity.
 */
export function maxMarketMakerLoss(b: number): number {
  return b * Math.log(2);
}

/**
 * Format a probability as a percentage string.
 */
export function formatProbability(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

/**
 * Format a number with appropriate decimal places.
 */
export function formatNumber(n: number, decimals: number = 2): string {
  return n.toFixed(decimals);
}



