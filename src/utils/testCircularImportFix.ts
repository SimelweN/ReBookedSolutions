/**
 * Test utility to verify that circular import fixes are working
 * This will attempt to import and use the refactored services
 */

import { getFunctionFallback } from "@/services/functionFallbackService";
import { initDatabaseStatusCheck } from "@/utils/databaseConnectivityHelper";

export const testCircularImportFix = () => {
  try {
    console.log("🧪 Testing circular import fixes...");

    // Test 1: FunctionFallbackService lazy initialization
    const fallbackService = getFunctionFallback();
    console.log(
      "✅ FunctionFallbackService lazy loading works:",
      !!fallbackService,
    );

    // Test 2: Database status check initialization
    initDatabaseStatusCheck();
    console.log("✅ Database status check initialization works");

    // Test 3: Check if we can get function stats (this would fail if C is not initialized)
    const stats = fallbackService.getFunctionStats();
    console.log(
      "✅ Function stats retrieval works:",
      typeof stats === "object",
    );

    console.log("🎉 All circular import fixes are working correctly!");
    return true;
  } catch (error) {
    console.error("❌ Circular import fix test failed:", error);
    return false;
  }
};

// Run test automatically in development
if (import.meta.env.DEV) {
  setTimeout(testCircularImportFix, 1000);
}
