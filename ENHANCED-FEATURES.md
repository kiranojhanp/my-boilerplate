# Enhanced Features: Zod + SuperJSON + Bun Authentication

This document showcases the advanced integration of **Zod validation**, **SuperJSON serialization**, and **Bun's authentication capabilities** in the API.

## 🔒 Enhanced Bun Authentication

### Password Hashing with Argon2

```typescript
// Enhanced password configuration
export const PASSWORD_CONFIG = {
  argon2: {
    algorithm: "argon2id" as const,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 1,
  },
} as const;

// Secure password hashing
const hashedPassword = await Bun.password.hash(
  password,
  PASSWORD_CONFIG.argon2
);

// Password verification with timing attack protection
const isValid = await Bun.password.verify(password, user.hashedPassword);
```

### Enhanced Crypto Utilities

```typescript
export class BunCryptoUtils {
  // Generate cryptographically secure random tokens
  static generateSecureToken(length: number = 32): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  // Hash data using Bun's CryptoHasher
  static async hashData(
    data: string,
    algorithm: "sha256" | "sha512" | "sha1" = "sha256"
  ): Promise<string> {
    const hasher = new Bun.CryptoHasher(algorithm);
    hasher.update(data);
    return hasher.digest("hex");
  }

  // Create HMAC for additional security
  static async createHMAC(
    data: string,
    secret: string,
    algorithm: "sha256" | "sha512" | "sha1" = "sha256"
  ): Promise<string> {
    const hasher = new Bun.CryptoHasher(algorithm, secret);
    hasher.update(data);
    return hasher.digest("hex");
  }
}
```

### Account Security Features

- **Account Lockout Protection**: Prevents brute force attacks
- **Failed Login Tracking**: Monitors and logs failed attempts
- **Enhanced JWT Tokens**: Includes issuer, audience, and JTI for tracking
- **Session Management**: Secure session ID generation

## 📝 Advanced Zod Validation

### Complex User Validation

```typescript
const complexUserSchema = z.object({
  // String validation with transformation
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .transform((val) => val.toLowerCase()),

  // Email with custom refinement
  email: z
    .string()
    .email()
    .refine(
      (email) => !email.includes("+"),
      "Email addresses with '+' are not allowed"
    ),

  // Advanced password validation
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character")
    .refine(
      (password) => !/(.)\1{2,}/.test(password),
      "No 3+ consecutive identical characters"
    ),

  // Array validation with uniqueness
  interests: z
    .array(z.string().min(1).max(50))
    .min(1)
    .max(10)
    .refine(
      (interests) => new Set(interests).size === interests.length,
      "Must be unique"
    ),

  // Nested object validation
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.enum(["US", "CA", "MX", "UK", "DE", "FR"]),
  }),

  // Union type validation
  contactMethod: z.union([
    z.object({ type: z.literal("email"), value: z.string().email() }),
    z.object({
      type: z.literal("phone"),
      value: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/),
    }),
  ]),
});
```

### File Upload Validation

```typescript
const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^<>:"/\\|?*]+$/, "Invalid filename characters"),

  mimeType: z.enum([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ]),

  size: z
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024), // 10MB limit

  content: z
    .string()
    .min(1)
    .refine((content) => {
      try {
        atob(content); // Validate base64
        return true;
      } catch {
        return false;
      }
    }, "Must be valid base64"),
});
```

### Search Validation with Filters

```typescript
const searchSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[^<>{}]+$/)
    .transform((val) => val.trim()),

  filters: z
    .object({
      dateRange: z
        .object({
          from: z.string().datetime(),
          to: z.string().datetime(),
        })
        .refine(
          ({ from, to }) => new Date(from) <= new Date(to),
          "Start date must be before end date"
        ),

      priceRange: z
        .object({
          min: z.number().min(0),
          max: z.number().min(0),
        })
        .refine(({ min, max }) => min <= max, "Min must be <= max"),
    })
    .optional(),
});
```

## 📦 SuperJSON Integration

### Supported Data Types

SuperJSON automatically handles serialization/deserialization of:

- **Date objects**: Preserved across client-server boundary
- **Map collections**: Maintains key-value relationships
- **Set collections**: Preserves unique value collections
- **BigInt**: Large integers beyond Number.MAX_SAFE_INTEGER
- **RegExp**: Regular expressions with flags
- **undefined**: Unlike JSON, preserves undefined values

### Example Usage

```typescript
// Server response with complex types
return {
  timestamp: new Date(), // ✅ Preserved as Date object
  bigNumber: BigInt("123456789012345678901234567890"), // ✅ Preserved as BigInt
  tags: new Set(["typescript", "bun", "superjson"]), // ✅ Preserved as Set
  metadata: new Map([
    ["version", "1.0.0"],
    ["author", "test"],
  ]), // ✅ Preserved as Map
  pattern: /test-pattern/gi, // ✅ Preserved as RegExp with flags
  optional: undefined, // ✅ Preserved (not removed like in JSON)
};
```

### Type Analysis

```typescript
function analyzeDataTypes(data: any) {
  return {
    hasDate: containsDate(data),
    hasMap: containsMap(data),
    hasSet: containsSet(data),
    hasBigInt: containsBigInt(data),
    hasRegex: containsRegex(data),
    hasUndefined: containsUndefined(data),
    typeCount: countTypes(data),
  };
}
```

## 🔧 API Endpoints

### Authentication Endpoints

```bash
# Register with enhanced validation
POST /trpc/auth.register
{
  "input": {
    "email": "user@example.com",
    "username": "myuser",
    "password": "VerySecurePassword123!@#"
  }
}

# Login with lockout protection
POST /trpc/auth.login
{
  "input": {
    "email": "user@example.com",
    "password": "VerySecurePassword123!@#"
  }
}
```

### Validation Endpoints

```bash
# Complex user validation
POST /trpc/validation.validateComplexUser
{
  "input": {
    "username": "testuser",
    "email": "test@example.com",
    "password": "VerySecurePassword123!@#",
    "age": 25,
    "interests": ["programming", "music"],
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "zipCode": "94102",
      "country": "US"
    },
    "contactMethod": {
      "type": "email",
      "value": "contact@example.com"
    }
  }
}

# File upload validation
POST /trpc/validation.validateFileUpload
Authorization: Bearer YOUR_TOKEN
{
  "input": {
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1048576,
    "content": "base64encodedcontent..."
  }
}

# Advanced search
GET /trpc/validation.validateSearch?input={"query":"search term","filters":{"category":"tech"}}

# Batch data validation
POST /trpc/validation.validateBatchData
{
  "input": {
    "items": [
      {
        "id": "uuid-1",
        "name": "Item 1",
        "value": 100,
        "category": "A"
      }
    ]
  }
}

# SuperJSON complex types
GET /trpc/validation.validateComplexTypes?input={"data":{"timestamp":"2024-01-01","bigInt":"123n"},"validateTypes":true}
```

## 🧪 Testing

### Run Enhanced Tests

```bash
# Start the server
bun run dev

# Run comprehensive tests
bun run test:enhanced
```

### Test Coverage

- ✅ SuperJSON serialization of all complex types
- ✅ Zod validation with custom refinements
- ✅ Account lockout protection
- ✅ Enhanced JWT token features
- ✅ File upload validation
- ✅ Batch data processing
- ✅ Advanced search filtering
- ✅ Password strength analysis
- ✅ Crypto utility functions

## 🛡️ Security Features

### Password Security

- **Argon2id hashing**: Industry-standard secure hashing
- **Configurable parameters**: Memory cost, time cost, parallelism
- **Timing attack protection**: Consistent verification timing
- **Password strength analysis**: Real-time strength feedback

### Token Security

- **Enhanced JWT**: Includes issuer, audience, and JTI
- **Secure token generation**: Cryptographically secure random tokens
- **Token refresh**: Secure token renewal mechanism
- **Session tracking**: Unique session identifiers

### Account Protection

- **Brute force protection**: Account lockout after failed attempts
- **Failed attempt tracking**: Monitor and log security events
- **Account status**: Active/inactive account management
- **Rate limiting**: Prevent abuse and DoS attacks

## 📊 Performance Benefits

### Bun Runtime Advantages

- **4x faster than Node.js**: For JavaScript execution
- **Built-in crypto**: No external dependencies
- **Optimized password hashing**: Native Argon2 implementation
- **Fast JSON parsing**: Optimized SuperJSON performance

### Validation Performance

- **Schema compilation**: Zod schemas are compiled for speed
- **Early validation**: Fail fast on invalid inputs
- **Type inference**: Compile-time type checking
- **Minimal runtime overhead**: Efficient validation execution

## 🚀 Production Recommendations

### Environment Variables

```bash
# Security
JWT_SECRET=your-super-secure-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Database Integration

Replace the in-memory user store with a production database:

```typescript
// Example with Prisma
export class DatabaseUserStore implements UserStore {
  async createUser(
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    const hashedPassword = await Bun.password.hash(
      password,
      PASSWORD_CONFIG.argon2
    );

    return await prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
      },
    });
  }

  // ... other methods
}
```

### Monitoring and Logging

- **Structured logging**: JSON logs for production
- **Metrics collection**: Prometheus metrics
- **Error tracking**: Comprehensive error logging
- **Security events**: Log authentication events

This enhanced integration provides a robust, secure, and performant foundation for modern web applications using the latest technologies and best practices.
