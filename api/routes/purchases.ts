import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";

export const purchases = new Elysia({ prefix: "/purchases" })
  // Get all purchases
  .get("/", async () => {
    try {
      const purchases = await prisma.purchase.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return { data: purchases };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to fetch purchases" },
      };
    }
  })

  // Get single purchase
  .get("/:id", async ({ params }) => {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!purchase) {
        return { error: { message: "Purchase not found" } };
      }

      return { data: purchase };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to fetch purchase" },
      };
    }
  })

  // Create purchase
  .post(
    "/",
    async ({ body }) => {
      try {
        // Validate carat value
        const validCarats = [9, 14, 18, 22, 24];
        if (!validCarats.includes(body.carat)) {
          return {
            error: {
              message: "Invalid carat value. Must be one of: 9, 14, 18, 22, 24",
            },
          };
        }

        // Validate user exists
        const user = await prisma.user.findUnique({
          where: { id: body.userId },
        });
        if (!user) {
          return { error: { message: "User not found" } };
        }

        // Validate category exists
        const category = await prisma.goldCategory.findUnique({
          where: { id: body.categoryId },
        });
        if (!category) {
          return { error: { message: "Category not found" } };
        }

        const purchase = await prisma.purchase.create({
          data: {
            receiptWeight: body.receiptWeight,
            realWeight: body.realWeight,
            carat: body.carat,
            recieptPrice: body.recieptPrice,
            purchasePrice: body.purchasePrice,
            userId: body.userId,
            categoryId: body.categoryId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return { data: purchase };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to create purchase" },
        };
      }
    },
    {
      body: t.Object({
        receiptWeight: t.Number({ minimum: 0 }),
        realWeight: t.Number({ minimum: 0 }),
        carat: t.Number(),
        recieptPrice: t.Number({ minimum: 0 }),
        purchasePrice: t.Number({ minimum: 0 }),
        userId: t.Number(),
        categoryId: t.Number(),
      }),
    },
  )

  // Update purchase
  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        // Check if purchase exists
        const existingPurchase = await prisma.purchase.findUnique({
          where: { id: parseInt(params.id) },
        });

        if (!existingPurchase) {
          return { error: { message: "Purchase not found" } };
        }

        // Validate carat value
        const validCarats = [9, 14, 18, 22, 24];
        if (!validCarats.includes(body.carat)) {
          return {
            error: {
              message: "Invalid carat value. Must be one of: 9, 14, 18, 22, 24",
            },
          };
        }

        // Validate user exists
        const user = await prisma.user.findUnique({
          where: { id: body.userId },
        });
        if (!user) {
          return { error: { message: "User not found" } };
        }

        // Validate category exists
        const category = await prisma.goldCategory.findUnique({
          where: { id: body.categoryId },
        });
        if (!category) {
          return { error: { message: "Category not found" } };
        }

        const purchase = await prisma.purchase.update({
          where: { id: parseInt(params.id) },
          data: {
            receiptWeight: body.receiptWeight,
            realWeight: body.realWeight,
            carat: body.carat,
            recieptPrice: body.recieptPrice,
            purchasePrice: body.purchasePrice,
            userId: body.userId,
            categoryId: body.categoryId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return { data: purchase };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to update purchase" },
        };
      }
    },
    {
      body: t.Object({
        receiptWeight: t.Number({ minimum: 0 }),
        realWeight: t.Number({ minimum: 0 }),
        carat: t.Number(),
        recieptPrice: t.Number({ minimum: 0 }),
        purchasePrice: t.Number({ minimum: 0 }),
        userId: t.Number(),
        categoryId: t.Number(),
      }),
    },
  )

  // Delete purchase
  .delete("/:id", async ({ params }) => {
    try {
      const existingPurchase = await prisma.purchase.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!existingPurchase) {
        return { error: { message: "Purchase not found" } };
      }

      await prisma.purchase.delete({
        where: { id: parseInt(params.id) },
      });

      return { data: { message: "Purchase deleted successfully" } };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to delete purchase" },
      };
    }
  });
