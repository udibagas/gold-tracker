import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding sample cleanings...");

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

  // Sample cleaning data
  const sampleCleanings = [
    {
      weightBefore: 25.5,
      weightAfter: 25.1,
      carat: 24,
      userId: users[0].id,
      categoryId: categories[0]?.id || 1,
    },
    {
      weightBefore: 15.2,
      weightAfter: 14.9,
      carat: 22,
      userId: users[0].id,
      categoryId: categories[1]?.id || 1,
    },
    {
      weightBefore: 10.5,
      weightAfter: 10.3,
      carat: 18,
      userId: users[0].id,
      categoryId: categories[2]?.id || 1,
    },
    {
      weightBefore: 8.7,
      weightAfter: 8.5,
      carat: 14,
      userId: users[0].id,
      categoryId: categories[3]?.id || 1,
    },
    {
      weightBefore: 12.3,
      weightAfter: 12.0,
      carat: 18,
      userId: users[0].id,
      categoryId: categories[4]?.id || 1,
    },
    {
      weightBefore: 20.0,
      weightAfter: 19.5,
      carat: 22,
      userId: users[0].id,
      categoryId: categories[5]?.id || 1,
    },
  ];

  // Create cleanings
  for (const cleaning of sampleCleanings) {
    try {
      const created = await prisma.cleaning.create({
        data: cleaning,
      });
      const loss = (created.weightBefore - created.weightAfter).toFixed(2);
      console.log(
        `✓ Created cleaning: ${created.weightBefore}g → ${created.weightAfter}g (${loss}g loss) ${created.carat}K`,
      );
    } catch (error) {
      console.log(`ℹ️  Skipping duplicate or error`);
    }
  }

  console.log("Cleanings seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
