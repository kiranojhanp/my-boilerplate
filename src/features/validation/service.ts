import type {
  ComplexUser,
  FileUpload,
  Search,
  BatchData,
  ComplexTypes,
  PasswordStrength,
  DataTypeAnalysis,
} from "./schemas";
import type { User } from "../auth/schemas";
import { BunCryptoUtils } from "../../shared/utils/auth";

export class ValidationService {
  static async validateComplexUser(input: ComplexUser) {
    // Calculate password strength
    const passwordStrength = this.calculatePasswordStrength(input.password);

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
  }

  static async validateFileUpload(input: FileUpload, user: User) {
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
  }

  static async validateSearch(input: Search) {
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
  }

  static async validateBatchData(input: BatchData) {
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
  }

  static validateComplexTypes(input: ComplexTypes) {
    const typeAnalysis = this.analyzeDataTypes(input.data);

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
  }

  // Helper function to calculate password strength
  private static calculatePasswordStrength(password: string): PasswordStrength {
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
  private static analyzeDataTypes(data: any): DataTypeAnalysis {
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
}
