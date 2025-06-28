import jwt from "jsonwebtoken";
import { logger } from "../../shared/utils/logger";
import type { User, AuthTokens, JWTPayload, RegisterInput } from "./schemas";

// Auth configuration
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

// Enhanced password configuration using Bun's crypto capabilities
export const PASSWORD_CONFIG = {
  argon2: {
    algorithm: "argon2id" as const,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 1,
  },
  bcrypt: {
    algorithm: "bcrypt" as const,
    cost: 12,
  },
} as const;

// Enhanced crypto utilities using Bun's built-in crypto
export class BunCryptoUtils {
  /**
   * Generate a cryptographically secure random string using Bun's crypto
   */
  static generateSecureToken(length: number = 32): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Hash data using Bun's CryptoHasher for additional security operations
   */
  static async hashData(
    data: string,
    algorithm: "sha256" | "sha512" | "sha1" = "sha256"
  ): Promise<string> {
    const hasher = new Bun.CryptoHasher(algorithm);
    hasher.update(data);
    return hasher.digest("hex");
  }

  /**
   * Create HMAC using Bun's CryptoHasher
   */
  static async createHMAC(
    data: string,
    secret: string,
    algorithm: "sha256" | "sha512" | "sha1" = "sha256"
  ): Promise<string> {
    const hasher = new Bun.CryptoHasher(algorithm, secret);
    hasher.update(data);
    return hasher.digest("hex");
  }

  /**
   * Generate a secure session ID
   */
  static generateSessionId(): string {
    return this.generateSecureToken(64);
  }
}

// In-memory user store (replace with database in production)
export class UserStore {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private failedLoginAttempts: Map<
    string,
    { count: number; lastAttempt: Date }
  > = new Map();

  async createUser(
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    if (this.usersByEmail.has(email)) {
      throw new Error("User with this email already exists");
    }
    if (this.usersByUsername.has(username)) {
      throw new Error("User with this username already exists");
    }

    // Enhanced password hashing with better security
    const hashedPassword = await Bun.password.hash(
      password,
      PASSWORD_CONFIG.argon2
    );

    const user: User = {
      id: crypto.randomUUID(),
      email,
      username,
      hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      loginAttempts: 0,
      isActive: true,
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(email, user);
    this.usersByUsername.set(username, user);

    logger.info(`User created: ${user.email}`, {
      userId: user.id,
      hashedPasswordLength: hashedPassword.length,
      algorithm: PASSWORD_CONFIG.argon2.algorithm,
    });
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.usersByUsername.get(username) || null;
  }

  async updateUser(
    id: string,
    updates: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);

    if (updates.email) {
      this.usersByEmail.delete(user.email);
      this.usersByEmail.set(updates.email, updatedUser);
    }

    if (updates.username) {
      this.usersByUsername.delete(user.username);
      this.usersByUsername.set(updates.username, updatedUser);
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.delete(id);
    this.usersByEmail.delete(user.email);
    this.usersByUsername.delete(user.username);

    logger.info(`User deleted: ${user.email}`, { userId: id });
    return true;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      // Enhanced password verification with timing attack protection
      const isValid = await Bun.password.verify(password, user.hashedPassword);

      if (isValid) {
        // Reset failed attempts on successful login
        this.failedLoginAttempts.delete(user.email);
        await this.updateUser(user.id, {
          lastLogin: new Date(),
          loginAttempts: 0,
        });
      } else {
        // Track failed attempts
        const attempts = this.failedLoginAttempts.get(user.email) || {
          count: 0,
          lastAttempt: new Date(),
        };
        attempts.count++;
        attempts.lastAttempt = new Date();
        this.failedLoginAttempts.set(user.email, attempts);

        await this.updateUser(user.id, {
          loginAttempts: (user.loginAttempts || 0) + 1,
        });
      }

      return isValid;
    } catch (error) {
      logger.error("Password verification error:", error);
      return false;
    }
  }

  /**
   * Check if user account is locked due to too many failed attempts
   */
  isAccountLocked(email: string): boolean {
    const attempts = this.failedLoginAttempts.get(email);
    if (!attempts) return false;

    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    if (attempts.count >= maxAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
      return timeSinceLastAttempt < lockoutDuration;
    }

    return false;
  }
}

export const userStore = new UserStore();

// Enhanced JWT utilities with better security
export function generateTokens(user: User): AuthTokens {
  const jti = BunCryptoUtils.generateSecureToken(16); // JWT ID for token tracking

  const accessPayload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    username: user.username,
    type: "access",
  };

  const refreshPayload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    username: user.username,
    type: "refresh",
  };

  const accessToken = jwt.sign(
    { ...accessPayload, jti: `access_${jti}` },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "basic-api",
      audience: "basic-api-users",
    } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { ...refreshPayload, jti: `refresh_${jti}` },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: "basic-api",
      audience: "basic-api-users",
    } as jwt.SignOptions
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "basic-api",
      audience: "basic-api-users",
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token format");
    }
    throw new Error("Token verification failed");
  }
}

export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
}

// Context type for authenticated procedures
export interface AuthContext {
  user: User;
}

// Helper to get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token);
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }

    return await userStore.getUserById(payload.userId);
  } catch (error) {
    logger.warn("Token verification failed:", error);
    return null;
  }
}
