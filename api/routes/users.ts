import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

export default new Elysia({ prefix: "/users" })
  // Get all users
  .get("/", async ({ set }) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: users,
      };
    } catch (error: any) {
      set.status = 500;
      return {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      };
    }
  })

  // Get single user
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(params.id) },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
          };
        }

        return {
          success: true,
          data: user,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch user",
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

  // Create user
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { name, email, password } = body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          set.status = 400;
          return {
            success: false,
            message: "User with this email already exists",
          };
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          message: "User created successfully",
          data: user,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to create user",
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    },
  )

  // Update user
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { name, email, password } = body;
        const userId = parseInt(params.id);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
          };
        }

        // Check if email is taken by another user
        if (email !== existingUser.email) {
          const emailTaken = await prisma.user.findUnique({
            where: { email },
          });

          if (emailTaken) {
            set.status = 400;
            return {
              success: false,
              message: "Email is already taken by another user",
            };
          }
        }

        // Prepare update data
        const updateData: any = {
          name,
          email,
        };

        // Only update password if provided
        if (password && password.length > 0) {
          updateData.password = await hashPassword(password);
        }

        // Update user
        const user = await prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          message: "User updated successfully",
          data: user,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to update user",
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
        email: t.String({ format: "email" }),
        password: t.Optional(t.String()),
      }),
    },
  )

  // Delete user
  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        const userId = parseInt(params.id);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
          };
        }

        // Delete user
        await prisma.user.delete({
          where: { id: userId },
        });

        return {
          success: true,
          message: "User deleted successfully",
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to delete user",
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
