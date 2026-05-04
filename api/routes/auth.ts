import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/auth";

// JWT secret - in production, use environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export default new Elysia({ prefix: "/auth" })
  // Setup JWT and Cookie plugins
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: "7d", // Token expires in 7 days
    }),
  )
  .use(cookie())

  // Login endpoint
  .post(
    "/login",
    async ({ body, set, jwt, cookie: { auth } }) => {
      try {
        const { email, password } = body;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          set.status = 401;
          return {
            success: false,
            message: "Invalid credentials",
          };
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
          set.status = 401;
          return {
            success: false,
            message: "Invalid credentials",
          };
        }

        // Generate JWT token
        const token = await jwt.sign({
          id: user.id,
          email: user.email,
          name: user.name,
        });

        // Set cookie
        auth?.set({
          value: token,
          httpOnly: true,
          maxAge: 7 * 86400, // 7 days
          path: "/",
          sameSite: "lax",
        });

        return {
          success: true,
          message: "Login successful",
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            token,
          },
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Login failed",
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )

  // Logout endpoint
  .post("/logout", async ({ cookie: { auth } }) => {
    auth?.remove();

    return {
      success: true,
      message: "Logged out successfully",
    };
  })

  // Get current user (protected route)
  .get("/me", async ({ cookie, jwt, set }) => {
    try {
      const token = cookie.auth;

      if (!token) {
        set.status = 401;
        return {
          success: false,
          message: "Not authenticated",
        };
      }

      // Verify and decode token
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return {
          success: false,
          message: "Invalid token",
        };
      }

      // Fetch fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id: payload.id as number },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
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
        data: { user },
      };
    } catch (error: any) {
      set.status = 500;
      return {
        success: false,
        message: "Failed to get user",
        error: error.message,
      };
    }
  });
