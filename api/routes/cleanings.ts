import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";

export const cleanings = new Elysia({ prefix: "/cleanings" })
  // Get all cleanings
  .get("/", async () => {
    try {
      const cleanings = await prisma.cleaning.findMany({
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

      return { data: cleanings };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to fetch cleanings" },
      };
    }
  })

  // Get single cleaning
  .get("/:id", async ({ params }) => {
    try {
      const cleaning = await prisma.cleaning.findUnique({
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

      if (!cleaning) {
        return { error: { message: "Cleaning not found" } };
      }

      return { data: cleaning };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to fetch cleaning" },
      };
    }
  })

  // Create cleaning
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

        const cleaning = await prisma.cleaning.create({
          data: {
            weightBefore: body.weightBefore,
            weightAfter: body.weightAfter,
            carat: body.carat,
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

        return { data: cleaning };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to create cleaning" },
        };
      }
    },
    {
      body: t.Object({
        weightBefore: t.Number({ minimum: 0 }),
        weightAfter: t.Number({ minimum: 0 }),
        carat: t.Number(),
        userId: t.Number(),
        categoryId: t.Number(),
      }),
    },
  )

  // Update cleaning
  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        // Check if cleaning exists
        const existingCleaning = await prisma.cleaning.findUnique({
          where: { id: parseInt(params.id) },
        });

        if (!existingCleaning) {
          return { error: { message: "Cleaning not found" } };
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

        const cleaning = await prisma.cleaning.update({
          where: { id: parseInt(params.id) },
          data: {
            weightBefore: body.weightBefore,
            weightAfter: body.weightAfter,
            carat: body.carat,
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

        return { data: cleaning };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to update cleaning" },
        };
      }
    },
    {
      body: t.Object({
        weightBefore: t.Number({ minimum: 0 }),
        weightAfter: t.Number({ minimum: 0 }),
        carat: t.Number(),
        userId: t.Number(),
        categoryId: t.Number(),
      }),
    },
  )

  // Delete cleaning
  .delete("/:id", async ({ params }) => {
    try {
      const existingCleaning = await prisma.cleaning.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!existingCleaning) {
        return { error: { message: "Cleaning not found" } };
      }

      await prisma.cleaning.delete({
        where: { id: parseInt(params.id) },
      });

      return { data: { message: "Cleaning deleted successfully" } };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to delete cleaning" },
      };
    }
  });
