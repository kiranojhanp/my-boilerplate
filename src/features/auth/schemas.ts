import { z } from "zod";

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  hashedPassword: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  loginAttempts: z.number().int().nonnegative().optional(),
  lastLogin: z.date().optional(),
  isActive: z.boolean().optional(),
});

// Auth tokens schema
export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});

// JWT payload schema
export const JWTPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  type: z.enum(["access", "refresh"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Input schemas for authentication
export const RegisterInputSchema = z.object({
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

export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const UpdateProfileInputSchema = z.object({
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

export const ChangePasswordInputSchema = z.object({
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

export const DeleteAccountInputSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
});

// Infer types from schemas
export type User = z.infer<typeof UserSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
export type DeleteAccountInput = z.infer<typeof DeleteAccountInputSchema>;
