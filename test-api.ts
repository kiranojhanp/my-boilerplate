#!/usr/bin/env bun

/**
 * Comprehensive test script for the API
 * Tests Zod validation, SuperJSON serialization, and authentication flows
 * Run with: bun run test-api.ts
 */

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class APITester {
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
    console.log("🧪 Starting API Integration Tests\n");

    let userTokens: any = null;

    // Test 1: Health Check
    await this.runTest("Health Check", async () => {
      const result = await this.trpcCall("health.check");
      if (!result.result?.data?.status) {
        throw new Error("Invalid health check response");
      }
    });

    // Test 2: Hello World (SuperJSON features)
    await this.runTest("Hello World with SuperJSON", async () => {
      const result = await this.trpcCall("hello.hello");
      const data = result.result?.data;

      // Check if SuperJSON preserved Date and Set objects
      if (!data?.timestamp || !data?.features) {
        throw new Error("SuperJSON features not preserved");
      }
    });

    // Test 3: Complex Data with SuperJSON
    await this.runTest("Complex Data Types", async () => {
      const result = await this.trpcCall("hello.complexData", {
        includeMetrics: true,
      });
      const data = result.result?.data;

      if (!data?.bigInt || !data?.regex || !data?.metrics) {
        throw new Error("Complex data types not serialized correctly");
      }
    });

    // Test 4: Zod Validation (should fail)
    await this.runTest("Zod Validation (Invalid Input)", async () => {
      try {
        await this.trpcCall("hello.helloName", { name: "" }); // Empty name should fail
        throw new Error("Should have failed validation");
      } catch (error) {
        if (
          !String(error).includes("validation") &&
          !String(error).includes("400")
        ) {
          throw error;
        }
        // Expected to fail - this is success
      }
    });

    // Test 5: User Registration
    await this.runTest("User Registration", async () => {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: "TestPassword123!",
      };

      const result = await this.trpcCall("auth.register", testUser);
      const data = result.result?.data;

      if (!data?.user?.id || !data?.tokens?.accessToken) {
        throw new Error("Registration failed or tokens missing");
      }

      userTokens = data.tokens;
    });

    // Test 6: Login
    await this.runTest("User Login", async () => {
      // Create a new user for login test
      const testUser = {
        email: `login${Date.now()}@example.com`,
        username: `loginuser${Date.now()}`,
        password: "LoginPassword123!",
      };

      // Register first
      await this.trpcCall("auth.register", testUser);

      // Then login
      const loginResult = await this.trpcCall("auth.login", {
        email: testUser.email,
        password: testUser.password,
      });

      const data = loginResult.result?.data;
      if (!data?.tokens?.accessToken) {
        throw new Error("Login failed or tokens missing");
      }
    });

    // Test 7: Protected Route (should fail without token)
    await this.runTest("Protected Route (No Token)", async () => {
      try {
        await this.trpcCall("auth.me");
        throw new Error("Should have failed without token");
      } catch (error) {
        if (
          !String(error).includes("UNAUTHORIZED") &&
          !String(error).includes("401")
        ) {
          throw error;
        }
        // Expected to fail - this is success
      }
    });

    // Test 8: Protected Route (with token)
    await this.runTest("Protected Route (With Token)", async () => {
      if (!userTokens?.accessToken) {
        throw new Error("No access token available from registration");
      }

      const result = await this.trpcCall(
        "auth.me",
        undefined,
        userTokens.accessToken
      );
      const data = result.result?.data;

      if (!data?.id || !data?.email) {
        throw new Error("Protected route failed to return user data");
      }
    });

    // Test 9: Protected Hello Endpoint
    await this.runTest("Protected Hello Endpoint", async () => {
      if (!userTokens?.accessToken) {
        throw new Error("No access token available");
      }

      const result = await this.trpcCall(
        "hello.protectedHello",
        { message: "Hello from authenticated user!" },
        userTokens.accessToken
      );

      const data = result.result?.data;
      if (!data?.user?.id || !data?.sessionInfo) {
        throw new Error("Protected hello endpoint failed");
      }
    });

    // Test 10: Token Refresh
    await this.runTest("Token Refresh", async () => {
      if (!userTokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const result = await this.trpcCall("auth.refresh", {
        refreshToken: userTokens.refreshToken,
      });

      const data = result.result?.data;
      if (!data?.tokens?.accessToken) {
        throw new Error("Token refresh failed");
      }
    });

    // Test 11: Invalid Password (should fail)
    await this.runTest("Invalid Password Format", async () => {
      try {
        await this.trpcCall("auth.register", {
          email: "test@example.com",
          username: "testuser",
          password: "weak", // Weak password should fail
        });
        throw new Error("Should have failed with weak password");
      } catch (error) {
        if (
          !String(error).includes("validation") &&
          !String(error).includes("400")
        ) {
          throw error;
        }
        // Expected to fail - this is success
      }
    });

    // Print results
    this.printResults();
  }

  printResults(): void {
    console.log("\n" + "=".repeat(80));
    console.log("🧪 TEST RESULTS");
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
        "\n🎉 All tests passed! The integration is working correctly."
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

  const tester = new APITester();
  await tester.runAllTests();
}

main().catch(console.error);
