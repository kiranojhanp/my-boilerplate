import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, loggedProcedure, protectedProcedure } from "../trpc";
import {
  userStore,
  generateTokens,
  verifyToken,
  getUserFromToken,
} from "../../utils/auth";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  email: z.string().email("Invalid email format").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export const authRouter = router({
  // Register a new user
  register: loggedProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        const user = await userStore.createUser(
          input.email,
          input.username,
          input.password
        );

        const tokens = generateTokens(user);

        return {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
          },
          tokens,
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: error.message,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),

  // Login with email and password
  login: loggedProcedure.input(loginSchema).mutation(async ({ input }) => {
    // Check if account is locked
    if (userStore.isAccountLocked(input.email)) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message:
          "Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.",
      });
    }

    const user = await userStore.getUserByEmail(input.email);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account has been deactivated. Please contact support.",
      });
    }

    const isPasswordValid = await userStore.verifyPassword(
      user,
      input.password
    );

    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const tokens = generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      tokens,
    };
  }),

  // Refresh access token
  refresh: loggedProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input }) => {
      try {
        const payload = verifyToken(input.refreshToken);

        if (payload.type !== "refresh") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid refresh token",
          });
        }

        const user = await userStore.getUserById(payload.userId);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }

        const tokens = generateTokens(user);

        return {
          tokens,
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired refresh token",
        });
      }
    }),

  // Get current user profile
  me: protectedProcedure.query(({ ctx }) => {
    const { user } = ctx.auth;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      try {
        const updatedUser = await userStore.updateUser(user.id, input);

        if (!updatedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
          });
        }

        return {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const isCurrentPasswordValid = await userStore.verifyPassword(
        user,
        input.currentPassword
      );

      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await Bun.password.hash(input.newPassword, {
        algorithm: "argon2id",
        memoryCost: 65536,
        timeCost: 2,
      });

      const updatedUser = await userStore.updateUser(user.id, {
        hashedPassword,
      });

      if (!updatedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update password",
        });
      }

      return {
        success: true,
        message: "Password updated successfully",
      };
    }),

  // Delete user account
  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z
          .string()
          .min(1, "Password is required for account deletion"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const isPasswordValid = await userStore.verifyPassword(
        user,
        input.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect password",
        });
      }

      const deleted = await userStore.deleteUser(user.id);

      if (!deleted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete account",
        });
      }

      return {
        success: true,
        message: "Account deleted successfully",
      };
    }),
});
