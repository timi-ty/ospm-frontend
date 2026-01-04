import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { prices, simulateBuy } from "@/lib/lmsr";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "ospm_traded";
const VISITOR_COOKIE = "ospm_visitor_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Check if user has already traded
    const hasTradedCookie = cookieStore.get(COOKIE_NAME);
    if (hasTradedCookie) {
      return NextResponse.json(
        { error: "You have already placed your bet! Clear cookies to trade again." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { side, amount } = body;

    // Validate input
    if (!side || !["YES", "NO"].includes(side)) {
      return NextResponse.json(
        { error: "Invalid side. Must be 'YES' or 'NO'." },
        { status: 400 }
      );
    }

    const spendAmount = parseFloat(amount);
    if (isNaN(spendAmount) || spendAmount <= 0 || spendAmount > 1000) {
      return NextResponse.json(
        { error: "Invalid amount. Must be between 0 and 1000." },
        { status: 400 }
      );
    }

    // Get the OSPM market
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
        { error: "Market not found." },
        { status: 404 }
      );
    }

    // Simulate the trade
    const simulation = simulateBuy(
      side as "YES" | "NO",
      market.qYes,
      market.qNo,
      market.b,
      spendAmount
    );

    // Get or create visitor ID for display purposes
    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    if (!visitorId) {
      visitorId = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // Update market and create trade in a transaction
    const [updatedMarket, trade] = await prisma.$transaction([
      prisma.market.update({
        where: { id: market.id },
        data: {
          qYes: side === "YES" ? market.qYes + simulation.deltaShares : market.qYes,
          qNo: side === "NO" ? market.qNo + simulation.deltaShares : market.qNo,
        },
      }),
      prisma.trade.create({
        data: {
          marketId: market.id,
          visitorId,
          side,
          amountSpent: simulation.cost,
          sharesGot: simulation.deltaShares,
          priceBefore: simulation.pBefore,
          priceAfter: simulation.pAfter,
        },
      }),
    ]);

    // Calculate new prices
    const { pYes, pNo } = prices(updatedMarket.qYes, updatedMarket.qNo, updatedMarket.b);

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        side: trade.side,
        amountSpent: trade.amountSpent,
        sharesGot: trade.sharesGot,
        priceBefore: trade.priceBefore,
        priceAfter: trade.priceAfter,
      },
      market: {
        id: updatedMarket.id,
        qYes: updatedMarket.qYes,
        qNo: updatedMarket.qNo,
        pYes,
        pNo,
      },
    });

    // Set cookies
    response.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error processing trade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check trade status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const hasTradedCookie = cookieStore.get(COOKIE_NAME);
    const visitorId = cookieStore.get(VISITOR_COOKIE)?.value;

    if (!hasTradedCookie || !visitorId) {
      return NextResponse.json({
        hasTraded: false,
        trade: null,
      });
    }

    // Find the visitor's trade
    const trade = await prisma.trade.findFirst({
      where: { visitorId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      hasTraded: true,
      trade: trade
        ? {
            id: trade.id,
            side: trade.side,
            amountSpent: trade.amountSpent,
            sharesGot: trade.sharesGot,
            priceBefore: trade.priceBefore,
            priceAfter: trade.priceAfter,
            createdAt: trade.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking trade status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


