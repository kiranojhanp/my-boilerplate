import type {
  HelloNameInput,
  CustomHelloInput,
  ProtectedHelloInput,
  ComplexDataInput,
  BasicHelloResponse,
  HelloNameResponse,
  CustomHelloResponse,
  ProtectedHelloResponse,
  ComplexDataResponse,
} from "./schemas";
import type { User } from "../auth/schemas";

export class HelloService {
  static getBasicHello(): BasicHelloResponse {
    return {
      message: "Hello World!",
      timestamp: new Date(), // SuperJSON will handle Date serialization
      version: "1.0.0",
      features: new Set(["authentication", "superjson", "zod"]), // SuperJSON handles Set
    };
  }

  static getHelloWithName(input: HelloNameInput): HelloNameResponse {
    return {
      message: `Hello, ${input.name}!`,
      timestamp: new Date(),
      name: input.name,
      metadata: new Map<string, any>([
        ["requestTime", new Date()],
        ["nameLength", input.name.length],
        ["greeting", "personalized"],
      ]), // SuperJSON handles Map
    };
  }

  static createCustomHello(input: CustomHelloInput): CustomHelloResponse {
    const greeting = input.name ? `Hello, ${input.name}!` : "Hello!";
    return {
      message: input.message,
      greeting,
      timestamp: new Date(),
      processed: true,
      tags: new Set(["custom", "mutation"]),
    };
  }

  static getProtectedHello(
    input: ProtectedHelloInput,
    user: User
  ): ProtectedHelloResponse {
    return {
      message: input.message,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      timestamp: new Date(),
      accessLevel: "authenticated",
      sessionInfo: new Map<string, any>([
        ["userId", user.id],
        ["loginTime", user.createdAt],
        ["lastUpdate", user.updatedAt],
      ]),
    };
  }

  static getComplexData(input: ComplexDataInput): ComplexDataResponse {
    const baseData = {
      message: "Complex data example",
      timestamp: new Date(),
      bigInt: BigInt(123456789012345678901234567890n), // SuperJSON handles BigInt
      regex: /hello-world/gi, // SuperJSON handles RegExp
      undefinedValue: undefined, // SuperJSON preserves undefined
    };

    if (input.includeMetrics) {
      return {
        ...baseData,
        metrics: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          lastChecked: new Date(),
          healthScore: 0.95,
          errors: new Map<string, number>([
            ["total", 0],
            ["lastHour", 0],
            ["critical", 0],
          ]),
        },
      };
    }

    return baseData;
  }
}
