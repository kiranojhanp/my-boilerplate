#!/usr/bin/env bun

/**
 * Enhanced test script showcasing Zod validation, SuperJSON, and Bun authentication
 * Tests all the advanced features including complex validation schemas
 * Run with: bun run enhanced-test.ts
 */

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class EnhancedAPITester {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        message: "✅ Passed",
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        message: `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start,
      });
    }
  }

  async trpcCall(
    procedure: string,
    input?: any,
    accessToken?: string
  ): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${BASE_URL}/trpc/${procedure}`, {
      method: input ? "POST" : "GET",
      headers,
      body: input ? JSON.stringify({ input }) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async runAllTests(): Promise<void> {
    console.log(
      "🚀 Starting Enhanced API Tests (Zod + SuperJSON + Bun Auth)\n"
    );

    let userTokens: any = null;

    // Test 1: SuperJSON Complex Data Types
    await this.runTest("SuperJSON Complex Data Types", async () => {
      const complexData = {
        includeMetrics: true,
      };

      const result = await this.trpcCall("hello.complexData", complexData);
      const data = result.result?.data;

      if (!data?.bigInt || !data?.regex || !data?.timestamp) {
        throw new Error("SuperJSON complex types not properly serialized");
      }

      // Verify BigInt serialization
      if (typeof data.bigInt !== "string" || !data.bigInt.includes("n")) {
        throw new Error("BigInt not properly serialized by SuperJSON");
      }

      console.log("   📦 SuperJSON preserved:", Object.keys(data));
    });

    // Test 2: Advanced Zod Validation - Complex User
    await this.runTest("Zod Advanced User Validation", async () => {
      const complexUser = {
        username: "TestUser123",
        email: "test@example.com",
        password: "VerySecurePassword123!@#",
        age: 25,
        birthDate: "1999-01-01T00:00:00.000Z",
        interests: ["programming", "music", "reading"],
        address: {
          street: "123 Main Street",
          city: "San Francisco",
          zipCode: "94102",
          country: "US",
        },
        contactMethod: {
          type: "email",
          value: "contact@example.com",
        },
        newsletter: true,
      };

      const result = await this.trpcCall(
        "validation.validateComplexUser",
        complexUser
      );
      const data = result.result?.data;

      if (!data?.validatedData || !data?.validationResults) {
        throw new Error("Complex user validation failed");
      }

      console.log(
        "   🔍 Password strength:",
        data.validatedData.passwordStrength.level
      );
      console.log("   📧 Email domain:", data.validationResults.emailDomain);
    });

    // Test 3: Zod Validation Errors (should fail gracefully)
    await this.runTest("Zod Validation Error Handling", async () => {
      try {
        await this.trpcCall("validation.validateComplexUser", {
          username: "a", // Too short
          email: "invalid-email", // Invalid format
          password: "weak", // Too weak
          age: 5, // Too young
          interests: [], // Empty array
          address: {
            street: "123",
            city: "SF",
            zipCode: "invalid",
            country: "INVALID",
          },
          contactMethod: {
            type: "email",
            value: "invalid",
          },
        });
        throw new Error("Should have failed validation");
      } catch (error) {
        if (
          !String(error).includes("validation") &&
          !String(error).includes("400")
        ) {
          throw error;
        }
        console.log("   ✅ Validation errors properly caught and formatted");
      }
    });

    // Test 4: Register User with Enhanced Security
    await this.runTest("Enhanced User Registration", async () => {
      const timestamp = Date.now();
      const testUser = {
        email: `enhanced${timestamp}@example.com`,
        username: `enhanced${timestamp}`,
        password: "VerySecurePassword123!@#$%",
      };

      const result = await this.trpcCall("auth.register", testUser);
      const data = result.result?.data;

      if (!data?.user?.id || !data?.tokens?.accessToken) {
        throw new Error("Enhanced registration failed");
      }

      userTokens = data.tokens;
      console.log("   🔐 User registered with enhanced security");
    });

    // Test 5: File Upload Validation
    await this.runTest("File Upload Validation", async () => {
      if (!userTokens?.accessToken) {
        throw new Error("No access token available");
      }

      const fileData = {
        filename: "test-document.pdf",
        mimeType: "application/pdf",
        size: 1024 * 1024, // 1MB
        content: Buffer.from("Test file content").toString("base64"),
      };

      const result = await this.trpcCall(
        "validation.validateFileUpload",
        fileData,
        userTokens.accessToken
      );

      const data = result.result?.data;
      if (!data?.fileInfo?.hash || !data?.fileInfo?.secureFilename) {
        throw new Error("File upload validation failed");
      }

      console.log(
        "   📎 File hash generated:",
        data.fileInfo.hash.substring(0, 16) + "..."
      );
      console.log("   🔒 Secure filename:", data.fileInfo.secureFilename);
    });

    // Test 6: Advanced Search Validation
    await this.runTest("Advanced Search Validation", async () => {
      const searchParams = {
        query: "advanced search test",
        filters: {
          category: "tech",
          dateRange: {
            from: "2024-01-01T00:00:00.000Z",
            to: "2024-12-31T23:59:59.999Z",
          },
          priceRange: {
            min: 10,
            max: 100,
          },
        },
        sort: {
          field: "date",
          order: "desc",
        },
        pagination: {
          page: 1,
          limit: 50,
        },
      };

      const result = await this.trpcCall(
        "validation.validateSearch",
        searchParams
      );
      const data = result.result?.data;

      if (!data?.searchParams || !data?.metadata?.searchHash) {
        throw new Error("Search validation failed");
      }

      console.log(
        "   🔍 Search hash:",
        data.metadata.searchHash.substring(0, 16) + "..."
      );
      console.log("   📊 Estimated results:", data.metadata.estimatedResults);
    });

    // Test 7: Batch Data Validation
    await this.runTest("Batch Data Validation", async () => {
      const batchData = {
        items: [
          {
            id: crypto.randomUUID(),
            name: "Item 1",
            value: 100,
            category: "A",
          },
          {
            id: crypto.randomUUID(),
            name: "Item 2",
            value: 1500, // High value
            category: "B",
          },
          {
            id: crypto.randomUUID(),
            name: "Item 3",
            value: 50,
            category: "C",
          },
        ],
      };

      const result = await this.trpcCall(
        "validation.validateBatchData",
        batchData
      );
      const data = result.result?.data;

      if (!data?.summary || !data?.validationResults) {
        throw new Error("Batch validation failed");
      }

      console.log("   📊 Batch processed:", data.summary.totalItems, "items");
      console.log("   💰 Total value:", data.summary.totalValue);
      console.log(
        "   ⚠️  High value warnings:",
        data.validationResults.filter((r: any) => r.warnings.length > 0).length
      );
    });

    // Test 8: SuperJSON Complex Types Analysis
    await this.runTest("SuperJSON Complex Types Analysis", async () => {
      const complexData = {
        data: {
          timestamp: new Date(),
          bigNumber: BigInt("123456789012345678901234567890"),
          regex: /test-pattern/gi,
          tags: new Set(["typescript", "bun", "superjson"]),
          metadata: new Map([
            ["version", "1.0.0"],
            ["author", "test"],
            ["date", new Date().toISOString()],
          ]),
          nested: {
            undefinedValue: undefined,
            nullValue: null,
            boolValue: true,
            numberValue: 42.5,
          },
        },
        validateTypes: true,
      };

      const result = await this.trpcCall(
        "validation.validateComplexTypes",
        complexData
      );
      const data = result.result?.data;

      if (!data?.typeAnalysis || !data?.superjsonFeatures) {
        throw new Error("Complex types analysis failed");
      }

      const features = data.superjsonFeatures;
      console.log("   📅 Preserves Date:", features.preservesDate);
      console.log("   🗺️  Preserves Map:", features.preservesMap);
      console.log("   📊 Preserves Set:", features.preservesSet);
      console.log("   🔢 Preserves BigInt:", features.preservesBigInt);
      console.log("   🔍 Preserves RegExp:", features.preservesRegex);
      console.log("   ❓ Preserves undefined:", features.preservesUndefined);
    });

    // Test 9: Account Lockout Protection
    await this.runTest("Account Lockout Protection", async () => {
      const testEmail = `lockout${Date.now()}@example.com`;
      const correctPassword = "CorrectPassword123!";
      const wrongPassword = "WrongPassword123!";

      // First register a user
      await this.trpcCall("auth.register", {
        email: testEmail,
        username: `lockoutuser${Date.now()}`,
        password: correctPassword,
      });

      // Try to login with wrong password multiple times
      let lockoutDetected = false;
      for (let i = 0; i < 6; i++) {
        try {
          await this.trpcCall("auth.login", {
            email: testEmail,
            password: wrongPassword,
          });
        } catch (error) {
          if (String(error).includes("Account temporarily locked")) {
            lockoutDetected = true;
            break;
          }
        }
      }

      if (!lockoutDetected) {
        throw new Error("Account lockout protection not working");
      }

      console.log("   🔒 Account lockout protection activated");
    });

    // Test 10: JWT Token Enhancement
    await this.runTest("Enhanced JWT Token Features", async () => {
      if (!userTokens?.accessToken) {
        throw new Error("No access token available");
      }

      // Test token refresh
      const refreshResult = await this.trpcCall("auth.refresh", {
        refreshToken: userTokens.refreshToken,
      });

      if (!refreshResult.result?.data?.tokens?.accessToken) {
        throw new Error("Token refresh failed");
      }

      // Test protected endpoint with new token
      const meResult = await this.trpcCall(
        "auth.me",
        undefined,
        refreshResult.result.data.tokens.accessToken
      );

      if (!meResult.result?.data?.id) {
        throw new Error("Protected endpoint failed with refreshed token");
      }

      console.log("   🔄 Token refresh successful");
      console.log("   ✅ Protected endpoint accessible with new token");
    });

    // Print results
    this.printResults();
  }

  printResults(): void {
    console.log("\n" + "=".repeat(80));
    console.log("🧪 ENHANCED TEST RESULTS");
    console.log("=".repeat(80));

    let passed = 0;
    let failed = 0;

    this.results.forEach((result, index) => {
      console.log(
        `${index + 1}. ${result.name} - ${result.message} (${result.duration}ms)`
      );
      if (result.passed) passed++;
      else failed++;
    });

    console.log("=".repeat(80));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(
      `📊 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`
    );
    console.log("=".repeat(80));

    if (failed > 0) {
      console.log(
        "\n⚠️  Some tests failed. Check the server logs for more details."
      );
      process.exit(1);
    } else {
      console.log(
        "\n🎉 All enhanced tests passed! Advanced integration working perfectly."
      );
      console.log(
        "🔥 Features tested: Zod validation, SuperJSON serialization, Bun auth, Advanced security"
      );
    }
  }
}

// Main execution
async function main() {
  // Check if server is running
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error("Server not responding");
    }
  } catch (error) {
    console.error("❌ Server is not running at", BASE_URL);
    console.log("Please start the server with: bun run dev");
    process.exit(1);
  }

  const tester = new EnhancedAPITester();
  await tester.runAllTests();
}

main().catch(console.error);
