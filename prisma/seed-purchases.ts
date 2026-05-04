import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = new PrismaClient({});

async function main() {
  console.log("🌱 Seeding sample purchases...");

  // Get existing users and categories
  const users = await prisma.user.findMany();
  const categories = await prisma.goldCategory.findMany();

  if (users.length === 0) {
    console.log("⚠️  No users found. Please run the user seeder first.");
    return;
  }

  if (categories.length === 0) {
    console.log(
      "⚠️  No categories found. Please run the category seeder first.",
    );
    return;
  }

  // Sample purchase data
  const samplePurchases = [
    {
      receiptWeight: 25.5,
      realWeight: 24.8,
      carat: 24,
      recieptPrice: 1500,
      purchasePrice: 1450,
      userId: users[0].id,
      categoryId: categories[0]?.id || 1,
    },
    {
      receiptWeight: 15.2,
      realWeight: 14.9,
      carat: 22,
      recieptPrice: 850,
      purchasePrice: 820,
      userId: users[0].id,
      categoryId: categories[1]?.id || 1,
    },
    {
      receiptWeight: 10.5,
      realWeight: 10.3,
      carat: 18,
      recieptPrice: 550,
      purchasePrice: 530,
      userId: users[0].id,
      categoryId: categories[2]?.id || 1,
    },
    {
      receiptWeight: 8.7,
      realWeight: 8.5,
      carat: 14,
      recieptPrice: 350,
      purchasePrice: 340,
      userId: users[0].id,
      categoryId: categories[3]?.id || 1,
    },
    {
      receiptWeight: 12.3,
      realWeight: 12.0,
      carat: 18,
      recieptPrice: 650,
      purchasePrice: 630,
      userId: users[0].id,
      categoryId: categories[4]?.id || 1,
    },
  ];

  // Create purchases
  for (const purchase of samplePurchases) {
    try {
      const created = await prisma.purchase.create({
        data: purchase,
      });
      console.log(
        `✓ Created purchase: ${created.realWeight}g ${created.carat}K`,
      );
    } catch (error) {
      console.log(`ℹ️  Skipping duplicate or error`);
    }
  }

  console.log("Purchases seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
