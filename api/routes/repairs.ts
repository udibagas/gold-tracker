import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";

export const repairs = new Elysia({ prefix: "/repairs" })
  // Get all repairs
  .get("/", async () => {
    try {
      const repairs = await prisma.repair.findMany({
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

      return { data: repairs };
    } catch (error: any) {
      return { error: { message: error.message || "Failed to fetch repairs" } };
    }
  })

  // Get single repair
  .get("/:id", async ({ params }) => {
    try {
      const repair = await prisma.repair.findUnique({
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

      if (!repair) {
        return { error: { message: "Repair not found" } };
      }

      return { data: repair };
    } catch (error: any) {
      return { error: { message: error.message || "Failed to fetch repair" } };
    }
  })

  // Create repair
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

        const repair = await prisma.repair.create({
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

        return { data: repair };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to create repair" },
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

  // Update repair
  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        // Check if repair exists
        const existingRepair = await prisma.repair.findUnique({
          where: { id: parseInt(params.id) },
        });

        if (!existingRepair) {
          return { error: { message: "Repair not found" } };
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

        const repair = await prisma.repair.update({
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

        return { data: repair };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to update repair" },
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

  // Delete repair
  .delete("/:id", async ({ params }) => {
    try {
      const existingRepair = await prisma.repair.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!existingRepair) {
        return { error: { message: "Repair not found" } };
      }

      await prisma.repair.delete({
        where: { id: parseInt(params.id) },
      });

      return { data: { message: "Repair deleted successfully" } };
    } catch (error: any) {
      return { error: { message: error.message || "Failed to delete repair" } };
    }
  });
