"use client";

import { useState } from "react";
import useSWR from "swr";
import MarketCard from "@/components/MarketCard";
import TradePanel from "@/components/TradePanel";
import AlreadyTraded from "@/components/AlreadyTraded";
import PriceChart from "@/components/PriceChart";
import TradeHistory from "@/components/TradeHistory";

interface Trade {
  id: string;
  visitorId: string;
  side: string;
  amountSpent: number;
  sharesGot: number;
  priceBefore: number;
  priceAfter: number;
  createdAt: string;
}

interface Market {
  id: string;
  question: string;
  b: number;
  qYes: number;
  qNo: number;
  pYes: number;
  pNo: number;
}

interface MarketData {
  market: Market;
  trades: Trade[];
  totalTrades: number;
}

interface TradeStatus {
  hasTraded: boolean;
  trade: Trade | null;
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json());

export default function Home() {
  const [isTrading, setIsTrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch market data with polling every 2 seconds
  const {
    data: marketData,
    error: marketError,
    mutate: mutateMarket,
  } = useSWR<MarketData>("/api/market", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  });

  // Fetch trade status (has user already traded?)
  const {
    data: tradeStatus,
    mutate: mutateTradeStatus,
  } = useSWR<TradeStatus>("/api/trade", fetcher);

  const handleTrade = async (side: "YES" | "NO", amount: number) => {
    setIsTrading(true);
    setError(null);

    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side, amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Trade failed");
        return;
      }

      // Refresh both market data and trade status
      await Promise.all([mutateMarket(), mutateTradeStatus()]);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Trade error:", err);
    } finally {
      setIsTrading(false);
    }
  };

  // Show loading state
  if (!marketData && !marketError) {
    return (
      <main className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-glow inline-block p-4 rounded-2xl bg-white/80 mb-4 shadow-sm">
            <svg
              className="w-10 h-10 text-[var(--accent)] animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Loading Market...</h2>
        </div>
      </main>
    );
  }

  // Show error state
  if (marketError || !marketData?.market) {
    return (
      <main className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">Market Not Found</h2>
          <p className="text-muted mb-6">
            The prediction market hasn&apos;t been set up yet. Please run the database
            seed script.
          </p>
          <code className="block p-4 bg-white rounded-xl text-sm text-[var(--accent)] border border-[var(--border-color)]">
            npm run db:seed
          </code>
        </div>
      </main>
    );
  }

  const { market, trades, totalTrades } = marketData;
  const hasTraded = tradeStatus?.hasTraded ?? false;
  const userTrade = tradeStatus?.trade ?? null;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <h1 className="inline-flex flex-col items-center justify-center border-[3px] border-current w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem] overflow-hidden mb-3">
            <span className="text-[2.2rem] md:text-[2.7rem] font-black leading-[0.8] tracking-[-0.08em]">OS</span>
            <span className="text-[2.2rem] md:text-[2.7rem] font-black leading-[0.8] tracking-[-0.08em]">PM</span>
          </h1>
          <p className="text-muted text-base md:text-lg max-w-xl mx-auto">
            An open-source prediction market experiment
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--yes-color)] animate-pulse" />
            <span className="text-sm text-muted">Live · Updates every 2s</span>
          </div>
        </header>

        {/* Manifesto */}
        <div className="card mb-10 md:mb-14 border-l-4 border-l-[var(--accent)]">
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)] mb-4">Why does this exist?</h2>
            <p className="text-muted leading-relaxed mb-4">
              Prediction markets will have a{" "}
              <span className="text-foreground font-medium">profound feedback effect on decision making</span>{" "}
              — similar to how the stock market influences public companies.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              For this reason, leading prediction markets should be{" "}
              <span className="text-[var(--accent)] font-medium">open source</span> for true democratization of tools that may shape humanity&apos;s future decisions.
            </p>
            <p className="text-muted leading-relaxed text-sm">
              This is <span className="text-foreground font-medium">OSPM</span> — an experiment in transparent, open-source prediction market infrastructure. 
              Place your bet below and become part of the story.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--no-color)]/10 border border-[var(--no-color)]/30 text-center">
            <p className="text-[var(--no-color)]">{error}</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Info */}
          <div className="lg:col-span-2 space-y-6">
            <MarketCard
              question={market.question}
              pYes={market.pYes}
              pNo={market.pNo}
              qYes={market.qYes}
              qNo={market.qNo}
              totalTrades={totalTrades}
              b={market.b}
            />

            <PriceChart trades={trades} currentPYes={market.pYes} />

            <TradeHistory trades={trades} />
          </div>

          {/* Right Column - Trade Panel */}
          <div className="space-y-6">
            {hasTraded && userTrade ? (
              <AlreadyTraded trade={userTrade} />
            ) : (
              <TradePanel
                qYes={market.qYes}
                qNo={market.qNo}
                b={market.b}
                pYes={market.pYes}
                pNo={market.pNo}
                onTrade={handleTrade}
                isLoading={isTrading}
              />
            )}

            {/* How It Works Link */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">How It Works</h3>
              <p className="text-sm text-muted mb-4">
                This market uses <span className="text-[var(--accent)] font-medium">LMSR</span>{" "}
                (Logarithmic Market Scoring Rule) for automated pricing. The
                price represents the market&apos;s collective probability estimate.
              </p>
              <ul className="text-sm text-muted space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--yes-color)]">→</span>
                  Buy YES if you think OSPM will hit 1M trades
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--no-color)]">→</span>
                  Buy NO if you think it won&apos;t happen
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">→</span>
                  Your bet moves the price based on LMSR math
                </li>
              </ul>
              <a
                href="/how-it-works"
                className="btn btn-outline w-full mt-4 text-sm"
              >
                Learn More About LMSR
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-14 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-sm text-muted">
            Built with Next.js, Prisma, and LMSR ·{" "}
            <span className="text-[var(--accent)]">Play money only</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
