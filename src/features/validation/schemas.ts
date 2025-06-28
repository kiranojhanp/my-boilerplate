import { z } from "zod";

// Advanced Zod schemas demonstrating various validation features
export const complexUserSchema = z.object({
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
export const fileUploadSchema = z.object({
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
export const searchSchema = z.object({
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

// Batch validation schema
export const batchDataSchema = z.object({
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
});

// Complex types validation schema
export const complexTypesSchema = z.object({
  data: z.any(), // Accept any data for SuperJSON demonstration
  validateTypes: z.boolean().default(true),
});

// Inferred types
export type ComplexUser = z.infer<typeof complexUserSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type Search = z.infer<typeof searchSchema>;
export type BatchData = z.infer<typeof batchDataSchema>;
export type ComplexTypes = z.infer<typeof complexTypesSchema>;

// Password strength analysis type
export type PasswordStrength = {
  score: number;
  level: string;
  feedback: string[];
};

// Data type analysis type
export type DataTypeAnalysis = {
  hasDate: boolean;
  hasMap: boolean;
  hasSet: boolean;
  hasBigInt: boolean;
  hasRegex: boolean;
  hasUndefined: boolean;
  typeCount: Record<string, number>;
};
