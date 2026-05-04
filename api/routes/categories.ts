import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";

export default new Elysia({ prefix: "/categories" })
  // Get all categories
  .get("/", async ({ set }) => {
    try {
      const categories = await prisma.goldCategory.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          _count: {
            select: {
              purchases: true,
              cleanings: true,
              repairs: true,
            },
          },
        },
      });

      return {
        success: true,
        data: categories,
      };
    } catch (error: any) {
      set.status = 500;
      return {
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
      };
    }
  })

  // Get single category
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const category = await prisma.goldCategory.findUnique({
          where: { id: parseInt(params.id) },
          include: {
            _count: {
              select: {
                purchases: true,
                cleanings: true,
                repairs: true,
              },
            },
          },
        });

        if (!category) {
          set.status = 404;
          return {
            success: false,
            message: "Category not found",
          };
        }

        return {
          success: true,
          data: category,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch category",
          error: error.message,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // Create category
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { name } = body;

        // Check if category already exists
        const existingCategory = await prisma.goldCategory.findFirst({
          where: { name },
        });

        if (existingCategory) {
          set.status = 400;
          return {
            success: false,
            message: "Category with this name already exists",
          };
        }

        // Create category
        const category = await prisma.goldCategory.create({
          data: {
            name,
          },
          include: {
            _count: {
              select: {
                purchases: true,
                cleanings: true,
                repairs: true,
              },
            },
          },
        });

        return {
          success: true,
          message: "Category created successfully",
          data: category,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to create category",
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
      }),
    },
  )

  // Update category
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { name } = body;
        const categoryId = parseInt(params.id);

        // Check if category exists
        const existingCategory = await prisma.goldCategory.findUnique({
          where: { id: categoryId },
        });

        if (!existingCategory) {
          set.status = 404;
          return {
            success: false,
            message: "Category not found",
          };
        }

        // Check if name is taken by another category
        if (name !== existingCategory.name) {
          const nameTaken = await prisma.goldCategory.findFirst({
            where: { name },
          });

          if (nameTaken) {
            set.status = 400;
            return {
              success: false,
              message: "Category name is already taken",
            };
          }
        }

        // Update category
        const category = await prisma.goldCategory.update({
          where: { id: categoryId },
          data: { name },
          include: {
            _count: {
              select: {
                purchases: true,
                cleanings: true,
                repairs: true,
              },
            },
          },
        });

        return {
          success: true,
          message: "Category updated successfully",
          data: category,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to update category",
          error: error.message,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 2 }),
      }),
    },
  )

  // Delete category
  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        const categoryId = parseInt(params.id);

        // Check if category exists
        const existingCategory = await prisma.goldCategory.findUnique({
          where: { id: categoryId },
          include: {
            _count: {
              select: {
                purchases: true,
                cleanings: true,
                repairs: true,
              },
            },
          },
        });

        if (!existingCategory) {
          set.status = 404;
          return {
            success: false,
            message: "Category not found",
          };
        }

        // Check if category has related records
        const totalRecords =
          existingCategory._count.purchases +
          existingCategory._count.cleanings +
          existingCategory._count.repairs;

        if (totalRecords > 0) {
          set.status = 400;
          return {
            success: false,
            message: `Cannot delete category. It has ${totalRecords} related record(s).`,
          };
        }

        // Delete category
        await prisma.goldCategory.delete({
          where: { id: categoryId },
        });

        return {
          success: true,
          message: "Category deleted successfully",
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to delete category",
          error: error.message,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
