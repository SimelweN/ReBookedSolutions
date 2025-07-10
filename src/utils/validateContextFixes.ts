/**
 * Context Validation Test
 * Verifies that all createContext fixes are working properly
 */

import * as React from "react";
import {
  createSafeContext,
  validateReactContextEnvironment,
} from "./reactContextSafety";

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  error?: string;
}

export function validateContextFixes(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Test 1: React environment validation
  try {
    const envValidation = validateReactContextEnvironment();
    results.push({
      test: "React Context Environment",
      passed: envValidation.isValid,
      message: envValidation.isValid
        ? "React context environment is valid"
        : "React context environment has issues",
      error: envValidation.errors.join(", ") || undefined,
    });
  } catch (error) {
    results.push({
      test: "React Context Environment",
      passed: false,
      message: "Failed to validate React context environment",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 2: Safe context creation
  try {
    const testContext = createSafeContext("test", "ValidationTest");
    const isValid =
      testContext &&
      typeof testContext === "object" &&
      testContext.Provider &&
      testContext.Consumer;

    results.push({
      test: "Safe Context Creation",
      passed: isValid,
      message: isValid
        ? "createSafeContext works correctly"
        : "createSafeContext failed to create proper context",
    });
  } catch (error) {
    results.push({
      test: "Safe Context Creation",
      passed: false,
      message: "createSafeContext threw an error",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 3: React.createContext availability
  try {
    const isAvailable =
      typeof React !== "undefined" && typeof React.createContext === "function";
    if (isAvailable) {
      const testContext = React.createContext(null);
      results.push({
        test: "React.createContext Direct Test",
        passed: true,
        message: "React.createContext is available and functional",
      });
    } else {
      results.push({
        test: "React.createContext Direct Test",
        passed: false,
        message: "React.createContext is not available",
      });
    }
  } catch (error) {
    results.push({
      test: "React.createContext Direct Test",
      passed: false,
      message: "React.createContext test failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 4: Context with Provider/Consumer pattern
  try {
    const TestContext = createSafeContext(
      { value: "test" },
      "ProviderConsumerTest",
    );

    // Test Provider exists
    const hasProvider =
      TestContext.Provider && typeof TestContext.Provider === "function";

    // Test Consumer exists
    const hasConsumer =
      TestContext.Consumer && typeof TestContext.Consumer === "function";

    results.push({
      test: "Provider/Consumer Pattern",
      passed: hasProvider && hasConsumer,
      message:
        hasProvider && hasConsumer
          ? "Context Provider and Consumer are properly available"
          : "Context Provider or Consumer is missing",
    });
  } catch (error) {
    results.push({
      test: "Provider/Consumer Pattern",
      passed: false,
      message: "Provider/Consumer test failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return results;
}

export function logValidationResults(results: ValidationResult[]): void {
  console.log("🔍 Context Validation Results:");
  console.log("=".repeat(50));

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result, index) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${index + 1}. ${result.test}: ${status}`);
    console.log(`   Message: ${result.message}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log("");

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  });

  console.log("=".repeat(50));
  console.log(`📊 Summary: ${passedCount} passed, ${failedCount} failed`);

  if (failedCount === 0) {
    console.log("🎉 All context validation tests passed!");
  } else {
    console.warn(`⚠️ ${failedCount} context validation tests failed`);
  }
}

// Auto-run validation in development mode
if (import.meta.env.DEV) {
  setTimeout(() => {
    const results = validateContextFixes();
    logValidationResults(results);
  }, 2000);
}

export default { validateContextFixes, logValidationResults };
