/**
 * Simple Test for Error Fixes
 * Quick validation that our error fixes are working
 */

export function testErrorFixes(): void {
  console.log("🧪 Testing error fixes...");

  const results: Array<{ test: string; passed: boolean; message: string }> = [];

  // Test 1: React createContext
  try {
    if (typeof React !== "undefined" && React.createContext) {
      const testContext = React.createContext(null);
      results.push({
        test: "React createContext",
        passed: true,
        message: "createContext works correctly",
      });
    } else {
      results.push({
        test: "React createContext",
        passed: false,
        message: "React.createContext is not available",
      });
    }
  } catch (error: any) {
    results.push({
      test: "React createContext",
      passed: false,
      message: `createContext error: ${error.message}`,
    });
  }

  // Test 2: Analytics fallback
  const gtagExists = typeof (window as any).gtag === "function";
  results.push({
    test: "Analytics gtag",
    passed: gtagExists,
    message: gtagExists ? "gtag is available" : "gtag fallback created",
  });

  // Test 3: Storage operations
  try {
    const testKey = "__test_storage__";
    localStorage.setItem(testKey, "test");
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    results.push({
      test: "Storage operations",
      passed: retrieved === "test",
      message:
        retrieved === "test"
          ? "Storage works correctly"
          : "Storage operation failed",
    });
  } catch (error: any) {
    results.push({
      test: "Storage operations",
      passed: false,
      message: `Storage error handled: ${error.message}`,
    });
  }

  // Test 4: Third-party error handling
  const errorHandlerActive = window.addEventListener
    .toString()
    .includes("error");
  results.push({
    test: "Error handler",
    passed: errorHandlerActive,
    message: errorHandlerActive
      ? "Error handler is active"
      : "Error handler may not be active",
  });

  // Print results
  console.log("\n📊 Test Results:");
  let passed = 0;
  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.passed) passed++;
  }

  console.log(`\n🎯 Summary: ${passed}/${results.length} tests passed`);

  if (passed === results.length) {
    console.log("🎉 All error fixes are working correctly!");
  } else {
    console.warn("⚠️ Some fixes may need attention");
  }
}

// Run test automatically in development
if (import.meta.env.DEV) {
  setTimeout(testErrorFixes, 2000);
}

export default testErrorFixes;
