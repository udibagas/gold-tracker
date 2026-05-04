import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding sample meltings...");

  // Get existing users
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log("⚠️  No users found. Please run the user seeder first.");
    return;
  }

  // Sample melting data (melting always results in weight loss)
  const sampleMeltings = [
    {
      weightBefore: 100.0,
      weightAfter: 95.5, // 4.5% loss
      carat: 24,
      userId: users[0].id,
    },
    {
      weightBefore: 75.5,
      weightAfter: 71.8, // 4.9% loss
      carat: 22,
      userId: users[0].id,
    },
    {
      weightBefore: 50.0,
      weightAfter: 47.2, // 5.6% loss
      carat: 18,
      userId: users[0].id,
    },
    {
      weightBefore: 35.7,
      weightAfter: 33.5, // 6.2% loss
      carat: 14,
      userId: users[0].id,
    },
    {
      weightBefore: 120.3,
      weightAfter: 114.8, // 4.6% loss
      carat: 22,
      userId: users[0].id,
    },
    {
      weightBefore: 80.0,
      weightAfter: 76.0, // 5.0% loss
      carat: 24,
      userId: users[0].id,
    },
  ];

  // Create meltings
  for (const melting of sampleMeltings) {
    try {
      const created = await prisma.melting.create({
        data: melting,
      });
      const loss = (created.weightBefore - created.weightAfter).toFixed(2);
      const lossPercent = (
        (parseFloat(loss) / created.weightBefore) *
        100
      ).toFixed(2);
      console.log(
        `✓ Created melting: ${created.weightBefore}g → ${created.weightAfter}g (${loss}g loss, ${lossPercent}%) ${created.carat}K`,
      );
    } catch (error) {
      console.log(`ℹ️  Skipping duplicate or error`);
    }
  }

  console.log("Meltings seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
