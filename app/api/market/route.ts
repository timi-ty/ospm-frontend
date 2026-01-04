import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { prices } from "@/lib/lmsr";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get the OSPM market (there's only one)
    const market = await prisma.market.findFirst({
      where: {
        question: {
          contains: "OSPM",
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Market not found. Please run the seed script." },
        { status: 404 }
      );
    }

    // Get recent trades (last 50)
    const trades = await prisma.trade.findMany({
      where: { marketId: market.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Calculate current prices
    const { pYes, pNo } = prices(market.qYes, market.qNo, market.b);

    // Get total trade count
    const totalTrades = await prisma.trade.count({
      where: { marketId: market.id },
    });

    return NextResponse.json({
      market: {
        id: market.id,
        question: market.question,
        b: market.b,
        qYes: market.qYes,
        qNo: market.qNo,
        pYes,
        pNo,
        createdAt: market.createdAt,
      },
      trades: trades.map((t) => ({
        id: t.id,
        visitorId: t.visitorId,
        side: t.side,
        amountSpent: t.amountSpent,
        sharesGot: t.sharesGot,
        priceBefore: t.priceBefore,
        priceAfter: t.priceAfter,
        createdAt: t.createdAt,
      })),
      totalTrades,
    });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


