import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";

export const meltings = new Elysia({ prefix: "/meltings" })
  // Get all meltings
  .get("/", async () => {
    try {
      const meltings = await prisma.melting.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return { data: meltings };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to fetch meltings" },
      };
    }
  })

  // Get single melting
  .get("/:id", async ({ params }) => {
    try {
      const melting = await prisma.melting.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!melting) {
        return { error: { message: "Melting not found" } };
      }

      return { data: melting };
    } catch (error: any) {
      return { error: { message: error.message || "Failed to fetch melting" } };
    }
  })

  // Create melting
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

        const melting = await prisma.melting.create({
          data: {
            weightBefore: body.weightBefore,
            weightAfter: body.weightAfter,
            carat: body.carat,
            userId: body.userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return { data: melting };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to create melting" },
        };
      }
    },
    {
      body: t.Object({
        weightBefore: t.Number({ minimum: 0 }),
        weightAfter: t.Number({ minimum: 0 }),
        carat: t.Number(),
        userId: t.Number(),
      }),
    },
  )

  // Update melting
  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        // Check if melting exists
        const existingMelting = await prisma.melting.findUnique({
          where: { id: parseInt(params.id) },
        });

        if (!existingMelting) {
          return { error: { message: "Melting not found" } };
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

        const melting = await prisma.melting.update({
          where: { id: parseInt(params.id) },
          data: {
            weightBefore: body.weightBefore,
            weightAfter: body.weightAfter,
            carat: body.carat,
            userId: body.userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return { data: melting };
      } catch (error: any) {
        return {
          error: { message: error.message || "Failed to update melting" },
        };
      }
    },
    {
      body: t.Object({
        weightBefore: t.Number({ minimum: 0 }),
        weightAfter: t.Number({ minimum: 0 }),
        carat: t.Number(),
        userId: t.Number(),
      }),
    },
  )

  // Delete melting
  .delete("/:id", async ({ params }) => {
    try {
      const existingMelting = await prisma.melting.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!existingMelting) {
        return { error: { message: "Melting not found" } };
      }

      await prisma.melting.delete({
        where: { id: parseInt(params.id) },
      });

      return { data: { message: "Melting deleted successfully" } };
    } catch (error: any) {
      return {
        error: { message: error.message || "Failed to delete melting" },
      };
    }
  });
