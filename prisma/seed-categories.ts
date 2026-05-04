import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({});

async function seedCategories() {
  console.log("Seeding gold categories...");

  const defaultCategories = [
    "Rings",
    "Necklaces",
    "Bracelets",
    "Earrings",
    "Pendants",
    "Chains",
    "Bangles",
    "Anklets",
  ];

  for (const categoryName of defaultCategories) {
    const existing = await prisma.goldCategory.findFirst({
      where: { name: categoryName },
    });

    if (!existing) {
      await prisma.goldCategory.create({
        data: { name: categoryName },
      });
      console.log(`✓ Created category: ${categoryName}`);
    } else {
      console.log(`- Category already exists: ${categoryName}`);
    }
  }

  console.log("Categories seeding completed!");
}

seedCategories()
  .catch((error) => {
    console.error("Error seeding categories:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
