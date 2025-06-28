import { z } from "zod";
import { router, loggedProcedure, protectedProcedure } from "../trpc";
import { BunCryptoUtils } from "../../utils/auth";

// Advanced Zod schemas demonstrating various validation features
const complexUserSchema = z.object({
  // Basic string validations
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .transform((val) => val.toLowerCase()),

  // Email with custom validation
  email: z
    .string()
    .email("Invalid email format")
    .refine(
      (email) => !email.includes("+"),
      "Email addresses with '+' are not allowed"
    ),

  // Advanced password validation
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .refine(
      (password) => !/(.)\1{2,}/.test(password),
      "Password cannot contain 3 or more consecutive identical characters"
    ),

  // Age with range validation
  age: z
    .number()
    .int("Age must be a whole number")
    .min(13, "Must be at least 13 years old")
    .max(120, "Age must be realistic"),

  // Optional birth date with validation
  birthDate: z
    .string()
    .datetime("Invalid date format")
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (date) => !date || date < new Date(),
      "Birth date cannot be in the future"
    ),

  // Array validation
  interests: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one interest is required")
    .max(10, "Maximum 10 interests allowed")
    .refine(
      (interests) => new Set(interests).size === interests.length,
      "Interests must be unique"
    ),

  // Object validation
  address: z.object({
    street: z.string().min(5, "Street address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
    country: z.enum(["US", "CA", "MX", "UK", "DE", "FR"], {
      errorMap: () => ({
        message: "Country must be one of: US, CA, MX, UK, DE, FR",
      }),
    }),
  }),

  // Union validation
  contactMethod: z.union([
    z.object({
      type: z.literal("email"),
      value: z.string().email(),
    }),
    z.object({
      type: z.literal("phone"),
      value: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number"),
    }),
    z.object({
      type: z.literal("sms"),
      value: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number"),
    }),
  ]),

  // Optional with default
  newsletter: z.boolean().default(false),

  // Custom validation with async check (simulated)
  profilePicture: z
    .string()
    .url("Invalid URL format")
    .optional()
    .refine(async (url) => {
      if (!url) return true;
      // Simulate checking if URL is accessible
      return url.startsWith("https://");
    }, "Profile picture must use HTTPS"),
});

// File upload validation schema
const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .regex(/^[^<>:"/\\|?*]+$/, "Invalid filename characters"),

  mimeType: z.enum(
    [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
    ],
    {
      errorMap: () => ({ message: "Unsupported file type" }),
    }
  ),

  size: z
    .number()
    .int("File size must be a whole number")
    .min(1, "File cannot be empty")
    .max(10 * 1024 * 1024, "File size cannot exceed 10MB"), // 10MB limit

  content: z
    .string()
    .min(1, "File content is required")
    .refine((content) => {
      try {
        // Check if it's valid base64
        atob(content);
        return true;
      } catch {
        return false;
      }
    }, "File content must be valid base64"),
});

// Search/filter schema with advanced validation
const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(200, "Search query too long")
    .regex(/^[^<>{}]+$/, "Invalid characters in search query")
    .transform((val) => val.trim()),

  filters: z
    .object({
      category: z
        .enum(["tech", "science", "art", "music", "sports"])
        .optional(),
      dateRange: z
        .object({
          from: z.string().datetime(),
          to: z.string().datetime(),
        })
        .refine(
          ({ from, to }) => new Date(from) <= new Date(to),
          "Start date must be before end date"
        )
        .optional(),
      priceRange: z
        .object({
          min: z.number().min(0),
          max: z.number().min(0),
        })
        .refine(
          ({ min, max }) => min <= max,
          "Minimum price must be less than or equal to maximum price"
        )
        .optional(),
    })
    .optional(),

  sort: z
    .object({
      field: z.enum(["date", "price", "relevance", "rating"]),
      order: z.enum(["asc", "desc"]),
    })
    .default({ field: "relevance", order: "desc" }),

  pagination: z
    .object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
    })
    .default({ page: 1, limit: 20 }),
});

export const validationRouter = router({
  // Complex user validation demo
  validateComplexUser: loggedProcedure
    .input(complexUserSchema)
    .mutation(async ({ input }) => {
      // Calculate password strength
      const passwordStrength = calculatePasswordStrength(input.password);

      // Generate a secure user ID using Bun crypto
      const secureUserId = BunCryptoUtils.generateSecureToken();

      return {
        message: "User data validation passed!",
        validatedData: {
          ...input,
          password: "[REDACTED]", // Never return passwords
          passwordStrength,
          secureId: secureUserId,
        },
        validationResults: {
          emailDomain: input.email.split("@")[1],
          usernameLength: input.username.length,
          interestCount: input.interests.length,
          addressCountry: input.address.country,
          contactType: input.contactMethod.type,
        },
        timestamp: new Date(),
      };
    }),

  // File upload validation
  validateFileUpload: protectedProcedure
    .input(fileUploadSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;

      // Calculate file hash for integrity checking
      const fileHash = await BunCryptoUtils.hashData(input.content, "sha256");

      // Generate secure filename
      const secureFilename = `${BunCryptoUtils.generateSecureToken(8)}_${input.filename}`;

      return {
        message: "File upload validation passed!",
        fileInfo: {
          originalFilename: input.filename,
          secureFilename,
          mimeType: input.mimeType,
          size: input.size,
          hash: fileHash,
          uploadedBy: user.id,
          uploadedAt: new Date(),
        },
        validation: {
          sizeInMB: (input.size / (1024 * 1024)).toFixed(2),
          isImage: input.mimeType.startsWith("image/"),
          extension: input.filename.split(".").pop()?.toLowerCase(),
        },
      };
    }),

  // Advanced search validation
  validateSearch: loggedProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      // Generate search hash for caching
      const searchHash = await BunCryptoUtils.hashData(
        JSON.stringify(input),
        "sha256"
      );

      return {
        message: "Search validation passed!",
        searchParams: input,
        metadata: {
          searchHash,
          estimatedResults: Math.floor(Math.random() * 1000) + 1,
          searchId: BunCryptoUtils.generateSecureToken(16),
          timestamp: new Date(),
        },
        pagination: {
          currentPage: input.pagination.page,
          itemsPerPage: input.pagination.limit,
          offset: (input.pagination.page - 1) * input.pagination.limit,
        },
      };
    }),

  // Batch validation demo
  validateBatchData: loggedProcedure
    .input(
      z.object({
        items: z
          .array(
            z.object({
              id: z.string().uuid("Invalid UUID format"),
              name: z.string().min(1).max(100),
              value: z.number().min(0),
              category: z.enum(["A", "B", "C"]),
            })
          )
          .min(1)
          .max(100, "Maximum 100 items allowed"),
      })
    )
    .mutation(async ({ input }) => {
      const validationResults = input.items.map((item, index) => ({
        index,
        id: item.id,
        isValid: true,
        warnings: item.value > 1000 ? ["High value detected"] : [],
      }));

      const totalValue = input.items.reduce((sum, item) => sum + item.value, 0);
      const averageValue = totalValue / input.items.length;

      return {
        message: "Batch validation completed!",
        summary: {
          totalItems: input.items.length,
          totalValue,
          averageValue: Math.round(averageValue * 100) / 100,
          categories: {
            A: input.items.filter((item) => item.category === "A").length,
            B: input.items.filter((item) => item.category === "B").length,
            C: input.items.filter((item) => item.category === "C").length,
          },
        },
        validationResults,
        processedAt: new Date(),
        batchId: BunCryptoUtils.generateSecureToken(),
      };
    }),

  // Custom validation with SuperJSON complex types
  validateComplexTypes: loggedProcedure
    .input(
      z.object({
        data: z.any(), // Accept any data for SuperJSON demonstration
        validateTypes: z.boolean().default(true),
      })
    )
    .query(({ input }) => {
      const typeAnalysis = analyzeDataTypes(input.data);

      return {
        message: "Complex type validation with SuperJSON",
        originalData: input.data,
        typeAnalysis,
        superjsonFeatures: {
          preservesDate: typeAnalysis.hasDate,
          preservesMap: typeAnalysis.hasMap,
          preservesSet: typeAnalysis.hasSet,
          preservesBigInt: typeAnalysis.hasBigInt,
          preservesRegex: typeAnalysis.hasRegex,
          preservesUndefined: typeAnalysis.hasUndefined,
        },
        timestamp: new Date(),
        metadata: new Map([
          ["processor", "SuperJSON"],
          ["bunVersion", Bun.version],
          ["nodeCompatible", "true"],
        ]),
      };
    }),
});

// Helper function to calculate password strength
function calculatePasswordStrength(password: string): {
  score: number;
  level: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push("Use at least 12 characters");

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Bonus for variety
  if (password.length > 16) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;

  let level: string;
  if (score >= 7) level = "Very Strong";
  else if (score >= 5) level = "Strong";
  else if (score >= 3) level = "Moderate";
  else level = "Weak";

  if (score < 5) {
    feedback.push("Consider adding more character variety");
  }

  return { score, level, feedback };
}

// Helper function to analyze data types for SuperJSON demo
function analyzeDataTypes(data: any): {
  hasDate: boolean;
  hasMap: boolean;
  hasSet: boolean;
  hasBigInt: boolean;
  hasRegex: boolean;
  hasUndefined: boolean;
  typeCount: Record<string, number>;
} {
  const typeCount: Record<string, number> = {};
  let hasDate = false;
  let hasMap = false;
  let hasSet = false;
  let hasBigInt = false;
  let hasRegex = false;
  let hasUndefined = false;

  function analyze(obj: any): void {
    if (obj === null) {
      typeCount.null = (typeCount.null || 0) + 1;
    } else if (obj === undefined) {
      hasUndefined = true;
      typeCount.undefined = (typeCount.undefined || 0) + 1;
    } else if (obj instanceof Date) {
      hasDate = true;
      typeCount.Date = (typeCount.Date || 0) + 1;
    } else if (obj instanceof Map) {
      hasMap = true;
      typeCount.Map = (typeCount.Map || 0) + 1;
      obj.forEach((value) => analyze(value));
    } else if (obj instanceof Set) {
      hasSet = true;
      typeCount.Set = (typeCount.Set || 0) + 1;
      obj.forEach((value) => analyze(value));
    } else if (obj instanceof RegExp) {
      hasRegex = true;
      typeCount.RegExp = (typeCount.RegExp || 0) + 1;
    } else if (typeof obj === "bigint") {
      hasBigInt = true;
      typeCount.BigInt = (typeCount.BigInt || 0) + 1;
    } else if (Array.isArray(obj)) {
      typeCount.Array = (typeCount.Array || 0) + 1;
      obj.forEach(analyze);
    } else if (typeof obj === "object") {
      typeCount.Object = (typeCount.Object || 0) + 1;
      Object.values(obj).forEach(analyze);
    } else {
      const type = typeof obj;
      typeCount[type] = (typeCount[type] || 0) + 1;
    }
  }

  analyze(data);

  return {
    hasDate,
    hasMap,
    hasSet,
    hasBigInt,
    hasRegex,
    hasUndefined,
    typeCount,
  };
}
