import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if any OSPM market already exists
  const existingMarket = await prisma.market.findFirst({
    where: {
      question: {
        contains: "OSPM",
      },
    },
  });

  if (existingMarket) {
    console.log("OSPM market already exists:", existingMarket.id);
    return;
  }

  // Create the single OSPM market
  const market = await prisma.market.create({
    data: {
      question:
        "Will Open Source Prediction Market (OSPM) hit 1M trades, scaring establishment prediction marketplaces?",
      b: 100, // LMSR liquidity parameter - higher = more liquidity, smoother prices
      qYes: 0,
      qNo: 0,
    },
  });

  console.log("Created OSPM market:", market);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
