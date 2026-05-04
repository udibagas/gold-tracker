import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = new PrismaClient({});

async function main() {
  console.log("🌱 Seeding sample repairs...");

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

  // Sample repair data (repairs can add or reduce weight)
  const sampleRepairs = [
    {
      weightBefore: 25.5,
      weightAfter: 26.2, // Weight increased (solder added)
      carat: 24,
      userId: users[0].id,
      categoryId: categories[0]?.id || 1,
    },
    {
      weightBefore: 15.2,
      weightAfter: 14.8, // Weight decreased (filing/polishing)
      carat: 22,
      userId: users[0].id,
      categoryId: categories[1]?.id || 1,
    },
    {
      weightBefore: 10.5,
      weightAfter: 11.0, // Weight increased (added components)
      carat: 18,
      userId: users[0].id,
      categoryId: categories[2]?.id || 1,
    },
    {
      weightBefore: 8.7,
      weightAfter: 8.5, // Weight decreased (removed damage)
      carat: 14,
      userId: users[0].id,
      categoryId: categories[3]?.id || 1,
    },
    {
      weightBefore: 12.3,
      weightAfter: 12.8, // Weight increased (reinforcement)
      carat: 18,
      userId: users[0].id,
      categoryId: categories[4]?.id || 1,
    },
    {
      weightBefore: 20.0,
      weightAfter: 19.7, // Weight decreased (reshaping)
      carat: 22,
      userId: users[0].id,
      categoryId: categories[5]?.id || 1,
    },
  ];

  // Create repairs
  for (const repair of sampleRepairs) {
    try {
      const created = await prisma.repair.create({
        data: repair,
      });
      const change = (created.weightAfter - created.weightBefore).toFixed(2);
      const changeText =
        created.weightAfter >= created.weightBefore
          ? `+${change}g gain`
          : `${change}g loss`;
      console.log(
        `✓ Created repair: ${created.weightBefore}g → ${created.weightAfter}g (${changeText}) ${created.carat}K`,
      );
    } catch (error) {
      console.log(`ℹ️  Skipping duplicate or error`);
    }
  }

  console.log("Repairs seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
